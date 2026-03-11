// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IVerifyProofAggregation.sol";

contract ZkVerifyTest {
    bytes32 public constant PROVING_SYSTEM_ID =
        keccak256(abi.encodePacked("groth16"));
    bytes32 public constant VERSION_HASH =
        sha256(abi.encodePacked(""));

    address public immutable zkVerify;
    bytes32 public immutable vkey;

    mapping(address => bool) public verified;

    event ProofVerified(address indexed user, bytes32 leaf);
    event ProofFailed(address indexed user);

    constructor(address _zkVerify, bytes32 _vkey) {
        zkVerify = _zkVerify;
        vkey = _vkey;
    }

    function verifyProof(
        uint256 _hash,
        uint256 _aggregationId,
        uint256 _domainId,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
    ) external {
        bytes32 leaf = keccak256(
            abi.encodePacked(
                PROVING_SYSTEM_ID,
                vkey,
                VERSION_HASH,
                keccak256(abi.encodePacked(_changeEndianess(_hash)))
            )
        );

        bool valid = IVerifyProofAggregation(zkVerify)
            .verifyProofAggregation(
                _domainId,
                _aggregationId,
                leaf,
                _merklePath,
                _leafCount,
                _index
            );

        if (valid) {
            verified[msg.sender] = true;
            emit ProofVerified(msg.sender, leaf);
        } else {
            emit ProofFailed(msg.sender);
            revert("Invalid proof");
        }
    }

    function _changeEndianess(
        uint256 input
    ) internal pure returns (uint256 v) {
        v = input;
        v =
            ((v &
                0xFF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00) >>
                8) |
            ((v &
                0x00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF) <<
                8);
        v =
            ((v &
                0xFFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000) >>
                16) |
            ((v &
                0x0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF) <<
                16);
        v =
            ((v &
                0xFFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000) >>
                32) |
            ((v &
                0x00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF) <<
                32);
        v =
            ((v &
                0xFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF0000000000000000) >>
                64) |
            ((v &
                0x0000000000000000FFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF) <<
                64);
        v = (v >> 128) | (v << 128);
    }
}

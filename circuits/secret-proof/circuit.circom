pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template SecretProof() {
    signal input secret;    // PRIVATE: der geheime Wert
    signal input hash;      // PUBLIC: Poseidon(secret)

    component hasher = Poseidon(1);
    hasher.inputs[0] <== secret;

    hash === hasher.out;
}

component main {public [hash]} = SecretProof();

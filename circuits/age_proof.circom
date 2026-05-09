pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template AgeProof() {
    // Public inputs (visible to verifier - e.g., the bank)
    signal input currentYear;
    signal input ageThreshold; // e.g., 18

    // Private inputs (hidden from everyone, only exists in user's client)
    signal input birthYear;

    // Output
    signal output isValid;

    // Calculate age
    signal age;
    age <== currentYear - birthYear;

    // Ensure age >= ageThreshold
    component greaterEq = GreaterEqThan(8); // 8-bit comparison (supports age up to 255)
    greaterEq.in[0] <== age;
    greaterEq.in[1] <== ageThreshold;

    isValid <== greaterEq.out;

    // Enforce that the proof is ONLY valid if the user meets the age threshold
    isValid === 1;
}

component main {public [currentYear, ageThreshold]} = AgeProof();

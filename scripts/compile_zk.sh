#!/bin/bash
# Script to compile the circuit and generate zkey for testing locally
# Prerequisite: Have 'circom' and 'snarkjs' installed globally
# npm install -g snarkjs
# Note: In a real production environment, you would run a multi-party trusted setup (Phase 2).

mkdir -p build

echo "1. Compiling circuit..."
circom circuits/age_proof.circom --r1cs --wasm --ptau --output build/

echo "2. Downloading Powers of Tau file (ptau)..."
# We use a small tau (12) for this simple circuit
wget -nc https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O build/pot12_final.ptau

echo "3. Generating zkey (Groth16 setup)..."
snarkjs groth16 setup build/age_proof.r1cs build/pot12_final.ptau build/age_proof_0000.zkey

echo "4. Contributing to Phase 2 ceremony (Mocking for demo)..."
echo "demo" | snarkjs zkey contribute build/age_proof_0000.zkey build/age_proof_final.zkey --name="1st Contributor Name" -v -e="random entropy string"

echo "5. Exporting Verification Key..."
snarkjs zkey export verificationkey build/age_proof_final.zkey build/verification_key.json

echo "Done! ZK artifacts generated in /build"

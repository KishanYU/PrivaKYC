<#
.SYNOPSIS
Compiles the ZK circuit using Docker (to avoid installing Rust on Windows) and snarkjs.
#>

$ErrorActionPreference = "Stop"

Write-Host "1. Building Circom Docker image (this takes a few minutes the first time)..." -ForegroundColor Cyan
# Create a quick Dockerfile inline
$dockerfile = @"
FROM rust:slim
RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/iden3/circom.git /circom
WORKDIR /circom
RUN cargo build --release && cargo install --path circom
WORKDIR /workspace
ENTRYPOINT ["circom"]
"@
$dockerfile | Out-File -Encoding UTF8 -FilePath Dockerfile.circom
docker build -t local-circom -f Dockerfile.circom .

Write-Host "`n2. Compiling circuit using Docker..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path build | Out-Null
# Run circom in docker, mounting the current directory
docker run --rm -v "$($PWD.Path):/workspace" local-circom circuits/age_proof.circom --r1cs --wasm --ptau --output build/

Write-Host "`n3. Downloading Powers of Tau file (ptau)..." -ForegroundColor Cyan
$ptauUrl = "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau"
$ptauFile = "build/pot12_final.ptau"
if (-Not (Test-Path $ptauFile)) {
    Invoke-WebRequest -Uri $ptauUrl -OutFile $ptauFile
}

Write-Host "`n4. Generating zkey (Groth16 setup)..." -ForegroundColor Cyan
snarkjs groth16 setup build/age_proof.r1cs build/pot12_final.ptau build/age_proof_0000.zkey

Write-Host "`n5. Contributing to Phase 2 ceremony (Mocking for demo)..." -ForegroundColor Cyan
# For Windows PowerShell, piping string into snarkjs
"demo" | snarkjs zkey contribute build/age_proof_0000.zkey build/age_proof_final.zkey --name="1st Contributor Name" -v -e="random_entropy_string_for_hackathon"

Write-Host "`n6. Exporting Verification Key..." -ForegroundColor Cyan
snarkjs zkey export verificationkey build/age_proof_final.zkey build/verification_key.json

Write-Host "`nDone! All ZK artifacts generated successfully in /build directory." -ForegroundColor Green

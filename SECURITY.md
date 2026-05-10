# Security Policy

## Supported Versions

We currently support the following versions of PrivaKYC with security updates:

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅         |
| < 1.0   | ❌         |

## Reporting a Vulnerability

We take the security of PrivaKYC seriously. If you believe you have found a security vulnerability, please do NOT open a public issue. Instead, please report it to us by:

1. Emailing **security@privakyc.io** (placeholder).
2. Providing a detailed description of the vulnerability.
3. Including steps to reproduce the issue.

We will acknowledge your report within 48 hours and provide a timeline for a fix.

## Security Architecture
PrivaKYC is designed with **Data Minimization** at its core.
- **No PII Storage**: We do not store Aadhaar numbers, DOBs, or Names in our database.
- **ZK Verification**: All sensitive data is processed locally to generate a non-invertible ZK proof.
- **Biometric Passkeys**: We use hardware-backed WebAuthn to prevent credential theft.

# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Prezvik seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please DO:

1. **Email us directly** at: [security@prezvik.dev] (or create a private security advisory on GitHub)
2. **Include the following information:**
   - Type of vulnerability
   - Full paths of source file(s) related to the vulnerability
   - Location of the affected source code (tag/branch/commit or direct URL)
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue, including how an attacker might exploit it

### What to expect:

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Updates**: We will send you regular updates about our progress
- **Timeline**: We aim to address critical vulnerabilities within 7 days
- **Credit**: If you wish, we will publicly credit you for the discovery once the vulnerability is fixed

## Security Best Practices

When using Prezvik:

### API Keys

- **Never commit API keys** to version control
- Use environment variables for all API keys
- Rotate API keys regularly
- Use separate API keys for development and production

### Input Validation

- Validate all user inputs before processing
- Be cautious with user-provided prompts that may contain malicious content
- Sanitize file paths and names

### Dependencies

- Keep dependencies up to date
- Review security advisories for dependencies
- Use `pnpm audit` to check for known vulnerabilities

### Generated Content

- Review AI-generated content before using in production
- Be aware that AI models may generate unexpected or inappropriate content
- Implement content filtering if needed for your use case

## Known Security Considerations

### AI Provider API Keys

Prezvik requires API keys for AI providers (OpenAI, Anthropic, Groq). These keys:

- Should be kept confidential
- Grant access to paid services
- Should have appropriate rate limits and spending caps configured

### File System Access

Prezvik writes files to the local file system:

- Ensure proper file permissions
- Validate output paths to prevent directory traversal
- Be cautious when running with elevated privileges

### Third-Party Dependencies

Prezvik uses several third-party packages:

- We regularly update dependencies
- Security patches are prioritized
- Check `pnpm audit` output regularly

## Security Updates

Security updates will be released as:

- **Critical**: Immediate patch release
- **High**: Patch release within 7 days
- **Medium**: Included in next minor release
- **Low**: Included in next release

Subscribe to GitHub releases or watch the repository to be notified of security updates.

## Contact

For security concerns, contact:

- GitHub Security Advisories: [Create a private security advisory](https://github.com/AIEraDev/prezvik/security/advisories/new)
- Email: security@prezvik.dev (if available)

## Acknowledgments

We appreciate the security research community and will acknowledge researchers who responsibly disclose vulnerabilities to us.

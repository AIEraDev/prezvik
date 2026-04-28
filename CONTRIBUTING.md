# Contributing to Prezvik

Thank you for your interest in contributing to Prezvik! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/prezvik.git
   cd prezvik
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Build all packages**:
   ```bash
   pnpm build
   ```
5. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

## Development Workflow

### Making Changes

1. **Create a new branch** for your feature or fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Build and test** your changes:

   ```bash
   # Build specific package
   pnpm --filter @prezvik/PACKAGE_NAME build

   # Run tests
   pnpm test

   # Test the CLI
   cd apps/cli
   node dist/index.js magic "test prompt"
   ```

4. **Commit your changes** with clear, descriptive messages:
   ```bash
   git add .
   git commit -m "feat: add new background style"
   ```

### Commit Message Convention

We follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:

```
feat: add gradient-mesh background style
fix: resolve text overflow in stat-trio layout
docs: update README with new examples
refactor: simplify positioning engine logic
```

### Pull Request Process

1. **Push your branch** to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Screenshots/examples if applicable
   - Reference any related issues

3. **Wait for review** - maintainers will review your PR and may request changes

4. **Address feedback** if requested

5. **Merge** - once approved, your PR will be merged!

## Project Structure

```
prezvik/
├── apps/
│   ├── cli/              # Command-line interface
│   ├── web/              # Next.js web application
│   ├── api/              # Express REST API
│   └── mcp-server/       # Model Context Protocol server
├── packages/
│   ├── core/             # Pipeline orchestration
│   ├── ai/               # AI integration (OpenAI, Anthropic, Groq)
│   ├── schema/           # Zod schemas and validation
│   ├── layout/           # Layout engine and strategies
│   ├── design/           # Theme system and backgrounds
│   ├── renderer-pptx/    # PowerPoint renderer
│   └── ...               # Other packages
└── examples/             # Example presentations
```

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Provide type annotations for public APIs
- Avoid `any` - use `unknown` if type is truly unknown

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use double quotes for strings
- Max line length: 120 characters
- Use meaningful variable names

### Documentation

- Add JSDoc comments for public functions and classes
- Include examples in documentation
- Update README.md if adding new features
- Keep comments concise and relevant

## Areas for Contribution

### High Priority

- **New Background Styles**: Add creative background generators
- **Layout Strategies**: Implement new slide layout types
- **Theme Presets**: Create industry-specific themes
- **Bug Fixes**: Check GitHub issues for bugs
- **Performance**: Optimize rendering and generation speed

### Medium Priority

- **Documentation**: Improve guides and examples
- **Tests**: Add test coverage for untested code
- **Examples**: Create example presentations
- **Internationalization**: Add multi-language support

### Advanced

- **New Renderers**: Implement Google Slides, PDF, or HTML renderers
- **AI Providers**: Add support for new AI providers
- **Layout Engine**: Improve positioning algorithms
- **Web UI**: Enhance the web application

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @prezvik/layout test

# Run tests in watch mode
pnpm --filter @prezvik/layout test --watch
```

### Writing Tests

- Place tests next to the code they test (e.g., `foo.test.ts` next to `foo.ts`)
- Use descriptive test names
- Test edge cases and error conditions
- Aim for high coverage on critical paths

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check README.md and package-specific docs

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other unprofessional conduct

## Recognition

Contributors will be recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Special mentions for major features

## Questions?

Feel free to open an issue or discussion if you have questions about contributing!

---

Thank you for contributing to Prezvik! 🎉

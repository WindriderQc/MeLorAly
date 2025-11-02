# Contributing to MeLorAly

Thank you for your interest in contributing to MeLorAly! This document provides guidelines for contributing to the project.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment
- Report inappropriate behavior to the maintainers

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm 9.x or higher
- Git
- Supabase account (for database features)

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/MeLorAly.git
   cd MeLorAly/MeLorAly/app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## 📋 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Test specific areas
npm run test:auth
```

**Before committing:**
- ✅ All tests pass
- ✅ No console errors in browser
- ✅ Code follows project conventions
- ✅ Documentation updated if needed

### 4. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "type: description"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style/formatting
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add password reset functionality"
git commit -m "fix: resolve login redirect loop"
git commit -m "docs: update API routes documentation"
git commit -m "test: add children profile tests"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title describing the change
- Detailed description of what and why
- Reference to related issues
- Screenshots if UI changes

## 🎨 Code Style Guidelines

### JavaScript/Node.js
- Use ES6+ features (const, let, arrow functions, async/await)
- Prefer `async/await` over callbacks
- Use descriptive variable and function names
- Keep functions small and focused
- Add JSDoc comments for complex functions

**Example:**
```javascript
/**
 * Load child data with permission check
 * @param {Object} req - Express request object
 * @param {string} childId - Child's UUID
 * @returns {Promise<Object>} Child data with family info
 */
async function loadChildForUser(req, childId) {
  // Implementation
}
```

### EJS Templates
- Use semantic HTML5 elements
- Follow Bootstrap 5 conventions
- Use design tokens (CSS variables) for colors
- Keep views DRY (use partials)

### CSS
- Use CSS variables from design system
- Follow BEM naming if adding new classes
- Mobile-first responsive design
- Maintain WCAG AA accessibility

## 🧪 Testing Guidelines

### Writing Tests
```javascript
describe('Feature Name', () => {
  describe('GET /route', () => {
    it('should do something specific', (done) => {
      request(app)
        .get('/route')
        .expect(200)
        .end(done);
    });
  });
});
```

### Test Requirements
- Write tests for new features
- Update tests when changing functionality
- Maintain 100% pass rate
- Use descriptive test names
- Test both success and error cases

## 📁 Project Structure

```
MeLorAly/
├── app/
│   ├── routes/          # Express route handlers
│   ├── middleware/      # Auth, validation, etc.
│   ├── views/           # EJS templates
│   ├── public/          # Static assets
│   ├── test/            # Test files
│   └── server.js        # Express app entry
├── docs/                # Documentation
├── archive/             # Historical documents
└── README.md
```

## 🐛 Reporting Bugs

### Before Submitting
- Check if the bug is already reported
- Test with the latest version
- Gather reproduction steps

### Bug Report Template
```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: [e.g., Windows 11, macOS 14]
- Browser: [e.g., Chrome 120]
- Node.js version: [e.g., 20.10.0]

**Screenshots:**
If applicable

**Additional Context:**
Any other relevant information
```

## 💡 Feature Requests

### Proposal Template
```markdown
**Feature Description:**
What feature you'd like to see

**Use Case:**
Why this feature is needed

**Proposed Solution:**
How you think it should work

**Alternatives Considered:**
Other approaches you've thought about

**Additional Context:**
Mockups, examples, etc.
```

## 🔍 Code Review Process

All contributions go through code review:

1. **Automated Checks**
   - Tests must pass
   - No linting errors
   - No security vulnerabilities

2. **Manual Review**
   - Code quality
   - Design patterns
   - Documentation
   - Test coverage

3. **Feedback**
   - Address reviewer comments
   - Update as needed
   - Maintain discussion

4. **Approval & Merge**
   - Requires 1+ approvals
   - Squash and merge preferred
   - Delete branch after merge

## 📚 Documentation

### Updating Documentation
- Update README.md for user-facing changes
- Update docs/ for technical details
- Add JSDoc comments for functions
- Update API_ROUTES.md for new endpoints
- Keep test documentation current

### Documentation Standards
- Clear, concise language
- Code examples where helpful
- Screenshots for UI features
- Keep up-to-date with code

## 🏆 Recognition

Contributors will be:
- Listed in project contributors
- Mentioned in release notes
- Credited in documentation

## 📞 Getting Help

- **Documentation:** Check `/docs` folder
- **Issues:** Search existing GitHub issues
- **Discussions:** GitHub Discussions
- **Tests:** Run `npm test` for guidance

## 🚀 Release Process

1. Version bump (semantic versioning)
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to production
5. Announce release

## ✅ Pull Request Checklist

Before submitting your PR:

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No console.log() debugging statements
- [ ] Branch up-to-date with main
- [ ] Self-review completed
- [ ] Breaking changes documented

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to MeLorAly!** 🎉

Your contributions help make family educational support accessible to everyone.

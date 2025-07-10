# GitHub Actions Workflows

This repository includes automated CI/CD workflows using GitHub Actions for continuous integration and npm package deployment.

## Workflows

### 1. CI Workflow (`ci.yml`)

Runs on every push and pull request to main branches (`main`, `master`, `develop`).

**Features:**
- **Multi-version testing**: Tests against Node.js versions 18, 20, and 22
- **Linting**: Runs code linting (if configured)
- **Security**: Performs npm security audit and checks for outdated packages
- **Build verification**: Ensures the package can be built and published

**Triggers:**
- Push to `main`, `master`, or `develop` branches
- Pull requests targeting these branches

### 2. NPM Publish Workflow (`npm-publish.yml`)

Automatically publishes the package to npm and creates GitHub releases.

**Features:**
- **Automated publishing**: Publishes to npm using existing package scripts
- **Dry run**: Performs a dry run before actual publishing
- **GitHub releases**: Creates releases with installation instructions
- **Version management**: Extracts and uses package.json version

**Triggers:**
- Push of version tags (e.g., `v1.0.0`, `v2.1.3`)
- GitHub releases
- Manual workflow dispatch

## Setup Instructions

### Required Secrets

To use these workflows, you need to configure the following secrets in your GitHub repository:

1. **NPM_TOKEN**: Your npm authentication token
   - Go to [npm.com](https://www.npmjs.com/) → Account Settings → Access Tokens
   - Create a new token with "Automation" type
   - Add it as a repository secret named `NPM_TOKEN`

2. **GITHUB_TOKEN**: Automatically provided by GitHub Actions (no setup required)

### Setting up Repository Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add the `NPM_TOKEN` secret with your npm token

## Usage

### Continuous Integration

The CI workflow runs automatically on every push and pull request. It will:
- Test your code across multiple Node.js versions
- Run linting and formatting checks
- Perform security audits
- Verify the package can be published

### Publishing a New Version

To publish a new version of your package:

1. **Update the version** in `package.json`:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. **Push the version tag**:
   ```bash
   git push origin main --tags
   ```

3. **The workflow will automatically**:
   - Run tests
   - Publish to npm
   - Create a GitHub release

### Manual Publishing

You can also trigger the publish workflow manually:

1. Go to Actions tab in your GitHub repository
2. Select "Publish to NPM" workflow
3. Click "Run workflow"
4. Optionally specify a version or leave empty to use package.json version

## Package Scripts Used

The workflows utilize the following npm scripts from your `package.json`:

- `npm test`: Run tests
- `npm run publish:dry`: Dry run publishing
- `npm run publish:npm`: Actual publishing to npm
- `npm run lint`: Code linting (optional)
- `npm run format`: Code formatting (optional)

## Workflow Status

You can monitor the status of your workflows in the "Actions" tab of your GitHub repository. Each workflow run will show:

- ✅ Success: All steps completed successfully
- ❌ Failure: One or more steps failed
- 🟡 In Progress: Workflow is currently running

## Troubleshooting

### Common Issues

1. **NPM_TOKEN not set**: Ensure you've added the npm token as a repository secret
2. **Permission denied**: Check that your npm token has the correct permissions
3. **Version already exists**: Make sure you've incremented the version in package.json
4. **Tests failing**: Fix any failing tests before the workflow can proceed

### Getting Help

If you encounter issues with the workflows:

1. Check the workflow logs in the Actions tab
2. Verify all required secrets are configured
3. Ensure your npm token is valid and has the necessary permissions
4. Check that your package.json scripts are working locally
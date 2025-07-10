# @zazin/gitlab-poller

A CLI tool for polling GitLab events and merge requests, keeping you notified of changes to merge requests you're reviewing.

## What It Does

The GitLab Poller monitors open merge requests and notifies you when they're updated. Run the tool, and it will:

- Check for merge requests assigned to you for review
- Track changes to those merge requests
- Print URLs of updated merge requests so you can quickly review them
- Run continuously in the background, checking every minute

## Quick Start

### 1. Install

Install globally via npm:

```bash
npm install -g @zazin/gitlab-poller
```

Or use directly with npx (no installation required):

```bash
npx @zazin/gitlab-poller
```

### 2. Configure

Set your GitLab reviewer ID and access token:

```bash
export GITLAB_REVIEWER_ID="your-username"
export GITLAB_TOKEN="your-gitlab-token"
```

For self-hosted GitLab instances:

```bash
export GITLAB_URL="https://your-gitlab-instance.com"
```

### 3. Run

Start the poller:

```bash
gitlab-poller
```

Or with npx:

```bash
npx @zazin/gitlab-poller
```

That's it! The tool will start monitoring and notify you of any changes.

## Requirements

- Node.js >= 20.0.0
- GitLab personal access token with `api` scope
- Your GitLab username/reviewer ID

## Configuration

The tool requires a few environment variables to work:

- `GITLAB_REVIEWER_ID`: Your GitLab username
- `GITLAB_TOKEN`: Your GitLab personal access token
- `GITLAB_URL`: Your GitLab instance URL (optional, defaults to gitlab.com)

You can set these as environment variables or create a `.env` file in `~/.gitlab-poller/`.

For detailed configuration options, see [Configuration Documentation](docs/configuration.md).

## Technical Documentation

For developers and advanced users:

- [Database Migrations](docs/database-migrations.md) - Database schema management
- [Configuration](docs/configuration.md) Detailed configuration options

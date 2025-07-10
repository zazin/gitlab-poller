# Configuration

## Overview
The GitLab Poller supports configurable reviewer ID instead of using a hardcoded value.

## Configuration Options

### Environment Variables
Set the reviewer ID using the `GITLAB_REVIEWER_ID` environment variable:

```bash
export GITLAB_REVIEWER_ID="your-reviewer-id"
```

### .env File
Add the reviewer ID to your `~/.gitlab-poller/.env` file:

```
GITLAB_REVIEWER_ID=your-reviewer-id
```

## Required Configuration
The `GITLAB_REVIEWER_ID` is now a required configuration parameter. The application will fail to start if this value is not provided.

## Additional Configuration

### GitLab Access Token
You'll need a GitLab personal access token with `api` scope. Set it using:

```bash
export GITLAB_TOKEN="your-gitlab-token"
```

Or add it to your `~/.gitlab-poller/.env` file:

```
GITLAB_TOKEN=your-gitlab-token
```

### GitLab Instance URL
For self-hosted GitLab instances, set the base URL:

```bash
export GITLAB_URL="https://your-gitlab-instance.com"
```

Or add it to your `~/.gitlab-poller/.env` file:

```
GITLAB_URL=https://your-gitlab-instance.com
```
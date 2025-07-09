# gitlab-poller

A CLI tool for polling GitLab events and merge requests, storing them in database sqlite

## Features

- Poll open merge requests by reviewer username
- Store merge requests in a sqlite database
- Configurable polling interval (default: 1 minute)
- Resume from the last processed event
- Support for self-hosted GitLab instances

## Requirements

- Node.js >= 20.0.0
- GitLab personal access token with `api` scope

## Installation

Install globally via npm:

```bash
npm install -g gitlab-poller
```

Or use directly with npx:

```bash
npx gitlab-poller
```

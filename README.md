# gitlab-poller

A CLI tool for polling GitLab

## Requirements

- Node.js >= 20.0.0

## Installation

Install globally via npm:

```bash
npm install -g gitlab-poller
```

Or use directly with npx:

```bash
npx gitlab-poller
```

## Usage

```bash
gitlab-poller [command] [options]
```

### Available Commands

- `help` - Show help message
- `version` - Show version information

## Development

Clone the repository:

```bash
git clone git@scm.salt.id:nurzazin/gitlab-poller.git
cd gitlab-poller
npm install
npm link
```

## Publishing

To publish to npm:

```bash
npm run deploy
```

## License

ISC
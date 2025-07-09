# gitlab-poller

A CLI tool for polling GitLab events and merge requests, storing them in a SQLite database

## Features

- Poll open merge requests by reviewer username
- Store merge requests in a SQLite database using Sequelize ORM
- Database migration support for schema changes
- Detect changes in merge requests and print their URLs when updated
- Configurable polling interval (default: 1 minute)
- Resume from the last processed event
- Support for self-hosted GitLab instances

## How It Works

The application polls GitLab for open merge requests at regular intervals. When a merge request is found:

1. It checks if the merge request exists in the local SQLite database
2. If it exists and has been updated (based on the `updated_at` timestamp), it prints the merge request URL
3. It saves the merge request data to the database for future comparison

This allows you to be notified when there are changes to merge requests you're reviewing.

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

Running the command without arguments will automatically start the GitLab poller. You can still use specific commands if needed:

```bash
npx gitlab-poller help    # Show help information
npx gitlab-poller version # Show version information
```

## Database Migrations

The application uses Sequelize ORM for database operations and supports database migrations for schema changes. This makes it easy to upgrade the database schema when new versions are released.

### Running Migrations

To run database migrations:

```bash
npm run db:migrate
```

### Creating New Migrations

If you need to create a new migration:

```bash
npm run db:create:migration your-migration-name
```

This will create a new migration file in the `db/migrations` directory. You can then edit this file to define your schema changes.

### Reverting Migrations

To revert the most recent migration:

```bash
npm run db:migrate:undo
```

To revert all migrations:

```bash
npm run db:migrate:undo:all
```

You can also use the Sequelize CLI directly if you prefer:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli migration:generate --name your-migration-name
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate:undo:all
```

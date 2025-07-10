# Database Migrations

The application uses Sequelize ORM for database operations and supports database migrations for schema changes. This makes it easy to upgrade the database schema when new versions are released.

## Running Migrations

To run database migrations:

```bash
npm run db:migrate
```

## Creating New Migrations

If you need to create a new migration:

```bash
npm run db:create:migration your-migration-name
```

This will create a new migration file in the `db/migrations` directory. You can then edit this file to define your schema changes.

## Reverting Migrations

To revert the most recent migration:

```bash
npm run db:migrate:undo
```

To revert all migrations:

```bash
npm run db:migrate:undo:all
```

## Using Sequelize CLI Directly

You can also use the Sequelize CLI directly if you prefer:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli migration:generate --name your-migration-name
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate:undo:all
```
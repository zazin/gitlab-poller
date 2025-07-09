# gitlab-poller

A CLI tool for polling GitLab events and merge requests, storing them in Supabase

## Features

- Poll GitLab project events or all accessible events
- Poll open merge requests by reviewer username
- Store events and merge requests in Supabase database
- Configurable polling interval (default: 1 minute)
- Resume from last processed event
- Support for self-hosted GitLab instances

## Requirements

- Node.js >= 20.0.0
- GitLab personal access token with `api` scope
- Supabase project with required tables

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

- `start` - Start polling GitLab events
- `merge-requests <username>` - Poll open merge requests for a reviewer
- `migrate` - Run database migrations
- `help` - Show help message
- `version` - Show version information

### Configuration

Create a `.env` file with the following variables:

```env
# GitLab Configuration
GITLAB_ACCESS_TOKEN=your_gitlab_personal_access_token
GITLAB_BASE_URL=https://gitlab.com

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_supabase_secret_key

# Polling Configuration
POLLING_INTERVAL=1

# Optional: Specific project ID (omit for all accessible projects)
# GITLAB_PROJECT_ID=123456
```

### Database Setup

#### Automatic Migration (Recommended)

The application will automatically check for required tables and prompt you to create them if they don't exist. Simply run:

```bash
gitlab-poller migrate
```

Or the tables will be checked when you start polling:

```bash
gitlab-poller start
```

#### Manual Setup

If you prefer to create tables manually, create the following tables in your Supabase project:

**1. GitLab Events Table:**
```sql
CREATE TABLE gitlab_events (
  id SERIAL PRIMARY KEY,
  gitlab_event_id INTEGER UNIQUE NOT NULL,
  action_name TEXT,
  target_id INTEGER,
  target_iid INTEGER,
  target_type TEXT,
  author_id INTEGER,
  author_username TEXT,
  created_at TIMESTAMPTZ,
  project_id INTEGER,
  target_title TEXT,
  push_data JSONB,
  note JSONB,
  wiki_page JSONB,
  raw_data JSONB,
  inserted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gitlab_event_id ON gitlab_events(gitlab_event_id);
CREATE INDEX idx_created_at ON gitlab_events(created_at);
CREATE INDEX idx_project_id ON gitlab_events(project_id);
```

**2. GitLab Merge Requests Table:**

```sql
CREATE TABLE gitlab_merge_requests (
  id SERIAL PRIMARY KEY,
  gitlab_mr_id INTEGER UNIQUE NOT NULL,
  gitlab_mr_iid INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  state TEXT,
  merged_by TEXT,
  merge_user TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  merged_at TIMESTAMPTZ,
  target_branch TEXT,
  source_branch TEXT,
  author_id INTEGER,
  author_username TEXT,
  assignee_id INTEGER,
  assignee_username TEXT,
  reviewer_username TEXT,
  reviewers JSONB,
  labels JSONB,
  web_url TEXT,
  has_conflicts BOOLEAN,
  blocking_discussions_resolved BOOLEAN,
  work_in_progress BOOLEAN,
  draft BOOLEAN,
  merge_status TEXT,
  raw_data JSONB,
  inserted_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gitlab_mr_id ON gitlab_merge_requests(gitlab_mr_id);
CREATE INDEX idx_project_id_mr ON gitlab_merge_requests(project_id);
CREATE INDEX idx_reviewer_username ON gitlab_merge_requests(reviewer_username);
CREATE INDEX idx_state ON gitlab_merge_requests(state);
CREATE INDEX idx_updated_at_mr ON gitlab_merge_requests(updated_at);
```

**3. Migrations Tracking Table:**
```sql
CREATE TABLE _migrations (
  version TEXT PRIMARY KEY,
  description TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Starting the Event Poller

```bash
gitlab-poller start
```

The poller will:
1. Connect to GitLab and Supabase
2. Fetch new events every minute
3. Store them in the `gitlab_events` table
4. Resume from the last processed event on restart

### Starting the Merge Request Poller

```bash
gitlab-poller merge-requests <reviewer-username>
```

Example:
```bash
gitlab-poller merge-requests john.doe
```

The merge request poller will:
1. Fetch all open merge requests where the specified user is a reviewer
2. Store/update them in the `gitlab_merge_requests` table
3. Poll for updates based on the configured interval

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
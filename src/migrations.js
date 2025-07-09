const migrations = [
  {
    version: '001',
    description: 'Create gitlab_events table',
    up: `
      CREATE TABLE IF NOT EXISTS gitlab_events (
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

      CREATE INDEX IF NOT EXISTS idx_gitlab_event_id ON gitlab_events(gitlab_event_id);
      CREATE INDEX IF NOT EXISTS idx_created_at ON gitlab_events(created_at);
      CREATE INDEX IF NOT EXISTS idx_project_id ON gitlab_events(project_id);
      CREATE INDEX IF NOT EXISTS idx_action_name ON gitlab_events(action_name);
      CREATE INDEX IF NOT EXISTS idx_author_username ON gitlab_events(author_username);
    `,
    down: `
      DROP TABLE IF EXISTS gitlab_events;
    `
  },
  {
    version: '002',
    description: 'Create gitlab_merge_requests table',
    up: `
      CREATE TABLE IF NOT EXISTS gitlab_merge_requests (
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

      CREATE INDEX IF NOT EXISTS idx_gitlab_mr_id ON gitlab_merge_requests(gitlab_mr_id);
      CREATE INDEX IF NOT EXISTS idx_project_id_mr ON gitlab_merge_requests(project_id);
      CREATE INDEX IF NOT EXISTS idx_reviewer_username ON gitlab_merge_requests(reviewer_username);
      CREATE INDEX IF NOT EXISTS idx_state ON gitlab_merge_requests(state);
      CREATE INDEX IF NOT EXISTS idx_updated_at_mr ON gitlab_merge_requests(updated_at);
      CREATE INDEX IF NOT EXISTS idx_author_username_mr ON gitlab_merge_requests(author_username);
      CREATE INDEX IF NOT EXISTS idx_assignee_username ON gitlab_merge_requests(assignee_username);
    `,
    down: `
      DROP TABLE IF EXISTS gitlab_merge_requests;
    `
  },
  {
    version: '003',
    description: 'Create migrations tracking table',
    up: `
      CREATE TABLE IF NOT EXISTS _migrations (
        version TEXT PRIMARY KEY,
        description TEXT,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
    down: `
      DROP TABLE IF EXISTS _migrations;
    `
  }
];

module.exports = migrations;
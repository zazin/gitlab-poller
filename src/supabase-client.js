const { createClient } = require('@supabase/supabase-js');
const { config } = require('./config');
const migrations = require('./migrations');

class SupabaseClient {
  constructor() {
    this.client = createClient(config.supabase.url, config.supabase.secretKey);
    this.tableName = config.supabase.tableName;
    this.mergeRequestsTableName = 'gitlab_merge_requests';
    this.migrationsTableName = '_migrations';
  }

  async insertEvents(events) {
    if (!events || events.length === 0) {
      return { data: [], error: null };
    }

    try {
      // Transform GitLab events to match Supabase table structure
      const transformedEvents = events.map(event => ({
        gitlab_event_id: event.id,
        action_name: event.action_name,
        target_id: event.target_id,
        target_iid: event.target_iid,
        target_type: event.target_type,
        author_id: event.author_id,
        author_username: event.author_username,
        created_at: event.created_at,
        project_id: event.project_id,
        target_title: event.target_title,
        push_data: event.push_data || null,
        note: event.note || null,
        wiki_page: event.wiki_page || null,
        raw_data: event, // Store complete event data
      }));

      const { data, error } = await this.client
        .from(this.tableName)
        .insert(transformedEvents)
        .select();

      if (error) {
        console.error('Error inserting events to Supabase:', error);
        return { data: null, error };
      }

      console.log(`Successfully inserted ${data.length} events to Supabase`);
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error in insertEvents:', error);
      return { data: null, error };
    }
  }

  async getLastEvent() {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('gitlab_event_id')
        .order('gitlab_event_id', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching last event:', error);
        return null;
      }

      return data ? data.gitlab_event_id : null;
    } catch (error) {
      console.error('Unexpected error in getLastEvent:', error);
      return null;
    }
  }

  async checkTableExists() {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .select('gitlab_event_id')
        .limit(1);

      if (error && error.code === '42P01') { // Table does not exist
        console.error(`Table '${this.tableName}' does not exist in Supabase`);
        console.log('Please create the table with the following structure:');
        console.log(`
CREATE TABLE ${this.tableName} (
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

CREATE INDEX idx_gitlab_event_id ON ${this.tableName}(gitlab_event_id);
CREATE INDEX idx_created_at ON ${this.tableName}(created_at);
CREATE INDEX idx_project_id ON ${this.tableName}(project_id);
        `);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking table existence:', error);
      return false;
    }
  }

  async upsertMergeRequests(mergeRequests, reviewerUsername) {
    if (!mergeRequests || mergeRequests.length === 0) {
      return { data: [], error: null };
    }

    try {
      // Transform GitLab merge requests to match Supabase table structure
      const transformedMRs = mergeRequests.map(mr => ({
        gitlab_mr_id: mr.id,
        gitlab_mr_iid: mr.iid,
        project_id: mr.project_id,
        title: mr.title,
        description: mr.description,
        state: mr.state,
        merged_by: mr.merged_by ? mr.merged_by.username : null,
        merge_user: mr.merge_user ? mr.merge_user.username : null,
        created_at: mr.created_at,
        updated_at: mr.updated_at,
        closed_at: mr.closed_at,
        merged_at: mr.merged_at,
        target_branch: mr.target_branch,
        source_branch: mr.source_branch,
        author_id: mr.author.id,
        author_username: mr.author.username,
        assignee_id: mr.assignee ? mr.assignee.id : null,
        assignee_username: mr.assignee ? mr.assignee.username : null,
        reviewer_username: reviewerUsername,
        reviewers: mr.reviewers || [],
        labels: mr.labels || [],
        web_url: mr.web_url,
        has_conflicts: mr.has_conflicts,
        blocking_discussions_resolved: mr.blocking_discussions_resolved,
        work_in_progress: mr.work_in_progress,
        draft: mr.draft,
        merge_status: mr.merge_status,
        raw_data: mr, // Store complete MR data
      }));

      const { data, error } = await this.client
        .from(this.mergeRequestsTableName)
        .upsert(transformedMRs, {
          onConflict: 'gitlab_mr_id',
          returning: 'minimal',
        });

      if (error) {
        console.error('Error upserting merge requests to Supabase:', error);
        return { data: null, error };
      }

      console.log(`Successfully upserted ${transformedMRs.length} merge requests to Supabase`);
      return { data: transformedMRs, error: null };
    } catch (error) {
      console.error('Unexpected error in upsertMergeRequests:', error);
      return { data: null, error };
    }
  }

  async checkMergeRequestsTableExists() {
    try {
      const { error } = await this.client
        .from(this.mergeRequestsTableName)
        .select('gitlab_mr_id')
        .limit(1);

      if (error && error.code === '42P01') { // Table does not exist
        console.error(`Table '${this.mergeRequestsTableName}' does not exist in Supabase`);
        console.log('Please create the table with the following structure:');
        console.log(`
CREATE TABLE ${this.mergeRequestsTableName} (
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

CREATE INDEX idx_gitlab_mr_id ON ${this.mergeRequestsTableName}(gitlab_mr_id);
CREATE INDEX idx_project_id_mr ON ${this.mergeRequestsTableName}(project_id);
CREATE INDEX idx_reviewer_username ON ${this.mergeRequestsTableName}(reviewer_username);
CREATE INDEX idx_state ON ${this.mergeRequestsTableName}(state);
CREATE INDEX idx_updated_at_mr ON ${this.mergeRequestsTableName}(updated_at);
        `);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking merge requests table existence:', error);
      return false;
    }
  }

  async runMigrations() {
    try {
      console.log('Running database migrations...');
      
      // Check if tables exist and create them if needed
      const tablesToCheck = [
        { name: 'gitlab_events', migration: migrations.find(m => m.version === '001') },
        { name: 'gitlab_merge_requests', migration: migrations.find(m => m.version === '002') },
        { name: '_migrations', migration: migrations.find(m => m.version === '003') }
      ];

      let migrationsRun = 0;

      for (const { name, migration } of tablesToCheck) {
        if (migration) {
          const tableExists = await this.checkTableExists(name);
          if (!tableExists) {
            console.log(`Creating table: ${name}`);
            
            // Split migration SQL into individual statements
            const statements = migration.up.split(';').filter(stmt => stmt.trim());
            
            for (const statement of statements) {
              if (statement.trim()) {
                try {
                  // Use raw SQL query instead of RPC
                  const { error } = await this.client
                    .from('_temp_migration_check')
                    .select('*')
                    .limit(0);
                  
                  // If we get here, we can't execute raw SQL directly
                  // Let's try a different approach - check if we can insert/select from existing tables
                  console.log(`Table ${name} needs to be created manually. Please run the following SQL in your Supabase dashboard:`);
                  console.log('\n' + migration.up + '\n');
                  
                } catch (err) {
                  // This is expected since the table doesn't exist
                }
              }
            }
            
            migrationsRun++;
          } else {
            console.log(`Table ${name} already exists`);
          }
        }
      }

      if (migrationsRun > 0) {
        console.log(`Migration check completed. Please ensure ${migrationsRun} tables are created in Supabase.`);
        console.log('If tables are missing, the SQL statements were printed above.');
      } else {
        console.log('All required tables exist');
      }

      return true;
    } catch (error) {
      console.error('Migration check failed:', error);
      return false;
    }
  }

  async checkTableExists(tableName) {
    try {
      const { error } = await this.client
        .from(tableName)
        .select('*')
        .limit(1);

      if (error && error.code === '42P01') {
        return false; // Table does not exist
      }

      return true; // Table exists
    } catch (error) {
      return false; // Assume table doesn't exist
    }
  }

  async ensureTablesExist() {
    try {
      const eventsTableExists = await this.checkTableExists('gitlab_events');
      const mrTableExists = await this.checkTableExists('gitlab_merge_requests');
      
      if (!eventsTableExists || !mrTableExists) {
        console.log('\n=== REQUIRED TABLES MISSING ===');
        console.log('Please create the following tables in your Supabase dashboard:');
        console.log('Go to: https://supabase.com/dashboard → Your Project → SQL Editor');
        console.log('\n1. GitLab Events Table:');
        console.log(migrations.find(m => m.version === '001').up);
        console.log('\n2. GitLab Merge Requests Table:');
        console.log(migrations.find(m => m.version === '002').up);
        console.log('\n3. Migrations Tracking Table:');
        console.log(migrations.find(m => m.version === '003').up);
        console.log('\n=== END REQUIRED TABLES ===\n');
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking table existence:', error);
      return false;
    }
  }
}

module.exports = SupabaseClient;
const GitLabClient = require('./gitlab-client');
const SupabaseClient = require('./supabase-client');
const { config, validateConfig } = require('./config');

class GitLabPoller {
  constructor() {
    this.gitlabClient = new GitLabClient();
    this.supabaseClient = new SupabaseClient();
    this.intervalId = null;
    this.isPolling = false;
  }

  async initialize() {
    try {
      validateConfig();
      
      console.log('Running database migrations...');
      await this.supabaseClient.runMigrations();
      
      console.log('Checking required tables...');
      const tablesExist = await this.supabaseClient.ensureTablesExist();
      if (!tablesExist) {
        throw new Error('Required Supabase tables are missing. Please run the SQL statements shown above.');
      }

      // Get the last event ID from Supabase to avoid duplicates
      const lastEventId = await this.supabaseClient.getLastEvent();
      if (lastEventId) {
        this.gitlabClient.lastEventId = lastEventId;
        console.log(`Resuming from last event ID: ${lastEventId}`);
      }

      console.log('GitLab Poller initialized successfully');
      console.log(`Polling interval: ${config.gitlab.pollingInterval / 60000} minute(s)`);
      console.log(`GitLab URL: ${config.gitlab.baseUrl}`);
      console.log(`Scope: ${config.gitlab.projectId ? `Project ${config.gitlab.projectId}` : 'All accessible projects'}`);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize poller:', error.message);
      return false;
    }
  }

  async poll() {
    if (this.isPolling) {
      console.log('Polling already in progress, skipping...');
      return;
    }

    this.isPolling = true;
    
    try {
      console.log(`[${new Date().toISOString()}] Polling GitLab events...`);
      
      let events;
      if (config.gitlab.projectId && config.gitlab.projectId !== 'all') {
        events = await this.gitlabClient.getProjectEvents();
      } else {
        events = await this.gitlabClient.getAllEvents();
      }

      if (events.length > 0) {
        console.log(`Found ${events.length} new events`);
        const { data, error } = await this.supabaseClient.insertEvents(events);
        
        if (error) {
          console.error('Failed to insert events:', error.message);
        } else {
          console.log(`Successfully processed ${events.length} events`);
        }
      } else {
        console.log('No new events found');
      }
    } catch (error) {
      console.error('Polling error:', error.message);
    } finally {
      this.isPolling = false;
    }
  }

  async start() {
    const initialized = await this.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize poller');
    }

    // Run initial poll
    await this.poll();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.poll();
    }, config.gitlab.pollingInterval);

    console.log('GitLab poller started successfully');
    console.log('Press Ctrl+C to stop');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.stop();
      process.exit(0);
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('\nGitLab poller stopped');
    }
  }
}

module.exports = GitLabPoller;
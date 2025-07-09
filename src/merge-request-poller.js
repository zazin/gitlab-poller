const GitLabClient = require('./gitlab-client');
const SupabaseClient = require('./supabase-client');
const { config, validateConfig } = require('./config');

class MergeRequestPoller {
  constructor() {
    this.gitlabClient = new GitLabClient();
    this.supabaseClient = new SupabaseClient();
    this.intervalId = null;
    this.isPolling = false;
  }

  async initialize(reviewerUsername) {
    try {
      validateConfig();
      
      if (!reviewerUsername) {
        throw new Error('Reviewer username is required');
      }

      this.reviewerUsername = reviewerUsername;
      
      console.log('Running database migrations...');
      await this.supabaseClient.runMigrations();
      
      console.log('Checking required tables...');
      const tablesExist = await this.supabaseClient.ensureTablesExist();
      if (!tablesExist) {
        throw new Error('Required Supabase tables are missing. Please run the SQL statements shown above.');
      }

      console.log('Merge Request Poller initialized successfully');
      console.log(`Polling interval: ${config.gitlab.pollingInterval / 60000} minute(s)`);
      console.log(`GitLab URL: ${config.gitlab.baseUrl}`);
      console.log(`Reviewer: ${reviewerUsername}`);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize merge request poller:', error.message);
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
      console.log(`[${new Date().toISOString()}] Polling merge requests for reviewer: ${this.reviewerUsername}...`);
      
      let mergeRequests;
      if (config.gitlab.projectId && config.gitlab.projectId !== 'all') {
        mergeRequests = await this.gitlabClient.getProjectMergeRequestsByReviewer(
          config.gitlab.projectId,
          this.reviewerUsername
        );
      } else {
        mergeRequests = await this.gitlabClient.getMergeRequestsByReviewer(this.reviewerUsername);
      }

      if (mergeRequests.length > 0) {
        console.log(`Found ${mergeRequests.length} open merge requests`);
        const { data, error } = await this.supabaseClient.upsertMergeRequests(
          mergeRequests,
          this.reviewerUsername
        );
        
        if (error) {
          console.error('Failed to upsert merge requests:', error.message);
        } else {
          console.log(`Successfully processed ${mergeRequests.length} merge requests`);
        }
      } else {
        console.log('No open merge requests found for the reviewer');
      }
    } catch (error) {
      console.error('Polling error:', error.message);
    } finally {
      this.isPolling = false;
    }
  }

  async start(reviewerUsername) {
    const initialized = await this.initialize(reviewerUsername);
    if (!initialized) {
      throw new Error('Failed to initialize merge request poller');
    }

    // Run initial poll
    await this.poll();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.poll();
    }, config.gitlab.pollingInterval);

    console.log('Merge request poller started successfully');
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
      console.log('\nMerge request poller stopped');
    }
  }
}

module.exports = MergeRequestPoller;
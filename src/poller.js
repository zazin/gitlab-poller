const GitLabClient = require('./gitlab-client');
const {config, validateConfig} = require('./config');

class GitLabPoller {
    constructor() {
        this.gitlabClient = new GitLabClient();
        this.intervalId = null;
        this.isPolling = false;
    }

    async initialize() {
        try {
            validateConfig();
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
            events = await this.gitlabClient.getMergeRequestsByReviewer('22347527');

            if (events.length > 0) {
                console.log(`Found ${events.length} new events`);
                for (const event of events) {
                    console.log(event);
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

        // Handle a graceful shutdown
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
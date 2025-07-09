const GitLabClient = require('./gitlab-client');
const {config, validateConfig} = require('./config');
const db = require('./db');

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

            let mergeRequests;
            mergeRequests = await this.gitlabClient.getMergeRequestsByReviewer('22347527');

            if (mergeRequests.length > 0) {
                console.log(`Found ${mergeRequests.length} merge requests`);

                for (const mergeRequest of mergeRequests) {
                    try {
                        // Check if this merge request exists in the database
                        const existingMR = await db.getMergeRequestByProjectAndIid(
                            mergeRequest.project_id, 
                            mergeRequest.iid
                        );

                        if(!existingMR) {
                            console.log(`New merge request: ${mergeRequest.web_url}`);
                        }
                        // If it exists and has been updated, print the URL
                        if (existingMR && existingMR.updated_at !== mergeRequest.updated_at) {
                            console.log(`Merge request updated: ${mergeRequest.web_url}`);
                        }

                        // Save the merge request to the database
                        await db.saveMergeRequest(mergeRequest);
                    } catch (error) {
                        console.error(`Error processing merge request ${mergeRequest.iid}:`, error.message);
                    }
                }
            } else {
                console.log('No merge requests found');
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

            // Close the database connection
            try {
                db.close();
                console.log('Database connection closed');
            } catch (error) {
                console.error('Error closing database connection:', error.message);
            }

            console.log('\nGitLab poller stopped');
        }
    }
}

module.exports = GitLabPoller;

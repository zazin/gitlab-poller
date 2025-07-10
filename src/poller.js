const GitLabClient = require('./gitlab-client');
const {config, validateConfig} = require('./config');
const db = require('./db');
const notifier = require('node-notifier');

class GitLabPoller {
    constructor(options = {}) {
        this.gitlabClient = options.gitlabClient || new GitLabClient();
        this.db = options.db || db;
        this.notifier = options.notifier || notifier;
        this.config = options.config || config;
        this.validateConfig = options.validateConfig || validateConfig;
        this.logger = options.logger || console;
        this.reviewerId = options.reviewerId || this.config.gitlab.reviewerId;
        this.intervalId = null;
        this.isPolling = false;
    }

    async initialize() {
        try {
            this.validateConfig();
            this.logger.log('GitLab Poller initialized successfully');
            this.logger.log(`Polling interval: ${this.config.gitlab.pollingInterval / 60000} minute(s)`);
            this.logger.log(`GitLab URL: ${this.config.gitlab.baseUrl}`);

            return true;
        } catch (error) {
            this.logger.error('Failed to initialize poller:', error.message);
            return false;
        }
    }

    async poll() {
        if (this.isPolling) {
            this.logger.log('Polling already in progress, skipping...');
            return;
        }

        this.isPolling = true;

        try {
            this.logger.log(`[${new Date().toISOString()}] Polling GitLab events...`);

            let mergeRequests;
            mergeRequests = await this.gitlabClient.getMergeRequestsByReviewer(this.reviewerId);

            if (mergeRequests.length > 0) {
                this.logger.log(`Found ${mergeRequests.length} merge requests`);

                for (const mergeRequest of mergeRequests) {
                    try {
                        // Check if this merge request exists in the database
                        const existingMR = await this.db.getMergeRequestByProjectAndIid(
                            mergeRequest.project_id, 
                            mergeRequest.iid
                        );

                        if(!existingMR) {
                            this.logger.log(`New merge request: ${mergeRequest.web_url}`);

                            // Send macOS notification
                            this.notifier.notify({
                                title: 'New Merge Request',
                                message: `${mergeRequest.title}`,
                                subtitle: `From: ${mergeRequest.author.name}`,
                                sound: true,
                                wait: true,
                                open: mergeRequest.web_url
                            });
                        }
                        // If it exists and has been updated, print the URL
                        if (existingMR && existingMR.updated_at !== mergeRequest.updated_at) {
                            this.logger.log(`Merge request updated: ${mergeRequest.web_url}`);
                        }

                        // Save the merge request to the database
                        await this.db.saveMergeRequest(mergeRequest);
                    } catch (error) {
                        this.logger.error(`Error processing merge request ${mergeRequest.iid}:`, error.message);
                    }
                }
            } else {
                this.logger.log('No merge requests found');
            }
        } catch (error) {
            this.logger.error('Polling error:', error.message);
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
        }, this.config.gitlab.pollingInterval);

        this.logger.log('GitLab poller started successfully');
        this.logger.log('Press Ctrl+C to stop');

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
                const closeResult = this.db.close();
                if (closeResult && typeof closeResult.then === 'function') {
                    closeResult.catch(error => {
                        this.logger.error('Error closing database connection:', error.message);
                    });
                }
                this.logger.log('Database connection closed');
            } catch (error) {
                this.logger.error('Error closing database connection:', error.message);
            }

            this.logger.log('\nGitLab poller stopped');
        }
    }
}

module.exports = GitLabPoller;

const GitLabPoller = require('../src/poller');

describe('GitLabPoller', () => {
    let poller;
    let mockGitlabClient;
    let mockDb;
    let mockNotifier;
    let mockConfig;
    let mockValidateConfig;
    let mockLogger;

    beforeEach(() => {
        // Mock dependencies
        mockGitlabClient = {
            getMergeRequestsByReviewer: jest.fn()
        };

        mockDb = {
            getMergeRequestByProjectAndIid: jest.fn(),
            saveMergeRequest: jest.fn(),
            close: jest.fn()
        };

        mockNotifier = {
            notify: jest.fn()
        };

        mockConfig = {
            gitlab: {
                pollingInterval: 60000,
                baseUrl: 'https://gitlab.example.com',
                reviewerId: 'config-reviewer-id'
            }
        };

        mockValidateConfig = jest.fn();

        mockLogger = {
            log: jest.fn(),
            error: jest.fn()
        };

        // Create a poller instance with mocked dependencies
        poller = new GitLabPoller({
            gitlabClient: mockGitlabClient,
            db: mockDb,
            notifier: mockNotifier,
            config: mockConfig,
            validateConfig: mockValidateConfig,
            logger: mockLogger,
            reviewerId: 'test-reviewer-id'
        });
    });

    describe('poll', () => {
        it('should process new merge requests and send notifications', async () => {
            // Arrange
            const mockMergeRequests = [
                {
                    id: 1,
                    iid: 100,
                    project_id: 10,
                    title: 'Test MR',
                    web_url: 'https://gitlab.example.com/project/-/merge_requests/100',
                    updated_at: '2023-01-01T00:00:00Z',
                    author: {
                        id: 1,
                        name: 'John Doe'
                    }
                }
            ];

            mockGitlabClient.getMergeRequestsByReviewer.mockResolvedValue(mockMergeRequests);
            mockDb.getMergeRequestByProjectAndIid.mockResolvedValue(null); // New MR
            mockDb.saveMergeRequest.mockResolvedValue({});

            // Act
            await poller.poll();

            // Assert
            expect(mockGitlabClient.getMergeRequestsByReviewer).toHaveBeenCalledWith('test-reviewer-id');
            expect(mockDb.getMergeRequestByProjectAndIid).toHaveBeenCalledWith(10, 100);
            expect(mockLogger.log).toHaveBeenCalledWith('Found 1 merge requests');
            expect(mockLogger.log).toHaveBeenCalledWith('New merge request: https://gitlab.example.com/project/-/merge_requests/100');
            expect(mockNotifier.notify).toHaveBeenCalledWith({
                title: 'New Merge Request',
                message: 'Test MR',
                subtitle: 'From: John Doe',
                sound: true,
                wait: true,
                open: 'https://gitlab.example.com/project/-/merge_requests/100'
            });
            expect(mockDb.saveMergeRequest).toHaveBeenCalledWith(mockMergeRequests[0]);
        });

        it('should handle updated merge requests without sending notifications', async () => {
            // Arrange
            const mockMergeRequests = [
                {
                    id: 1,
                    iid: 100,
                    project_id: 10,
                    title: 'Updated MR',
                    web_url: 'https://gitlab.example.com/project/-/merge_requests/100',
                    updated_at: '2023-01-02T00:00:00Z',
                    author: {
                        id: 1,
                        name: 'John Doe'
                    }
                }
            ];

            const existingMR = {
                id: 1,
                updated_at: '2023-01-01T00:00:00Z'
            };

            mockGitlabClient.getMergeRequestsByReviewer.mockResolvedValue(mockMergeRequests);
            mockDb.getMergeRequestByProjectAndIid.mockResolvedValue(existingMR);
            mockDb.saveMergeRequest.mockResolvedValue({});

            // Act
            await poller.poll();

            // Assert
            expect(mockLogger.log).toHaveBeenCalledWith('Merge request updated: https://gitlab.example.com/project/-/merge_requests/100');
            expect(mockNotifier.notify).not.toHaveBeenCalled(); // No notification for updates
            expect(mockDb.saveMergeRequest).toHaveBeenCalledWith(mockMergeRequests[0]);
        });

        it('should handle errors gracefully when processing merge requests', async () => {
            // Arrange
            const mockMergeRequests = [
                {
                    id: 1,
                    iid: 100,
                    project_id: 10,
                    title: 'Test MR',
                    web_url: 'https://gitlab.example.com/project/-/merge_requests/100',
                    updated_at: '2023-01-01T00:00:00Z',
                    author: {
                        id: 1,
                        name: 'John Doe'
                    }
                }
            ];

            mockGitlabClient.getMergeRequestsByReviewer.mockResolvedValue(mockMergeRequests);
            mockDb.getMergeRequestByProjectAndIid.mockRejectedValue(new Error('Database error'));

            // Act
            await poller.poll();

            // Assert
            expect(mockLogger.error).toHaveBeenCalledWith('Error processing merge request 100:', 'Database error');
        });

        it('should skip polling when already in progress', async () => {
            // Arrange
            poller.isPolling = true;

            // Act
            await poller.poll();

            // Assert
            expect(mockLogger.log).toHaveBeenCalledWith('Polling already in progress, skipping...');
            expect(mockGitlabClient.getMergeRequestsByReviewer).not.toHaveBeenCalled();
        });
    });

    describe('constructor', () => {
        it('should use reviewerId from config when not provided in options', () => {
            // Arrange & Act
            const pollerWithoutReviewerId = new GitLabPoller({
                gitlabClient: mockGitlabClient,
                db: mockDb,
                notifier: mockNotifier,
                config: mockConfig,
                validateConfig: mockValidateConfig,
                logger: mockLogger
                // No reviewerId provided in options
            });

            // Assert
            expect(pollerWithoutReviewerId.reviewerId).toBe('config-reviewer-id');
        });

        it('should use reviewerId from options when provided', () => {
            // Arrange & Act
            const pollerWithReviewerId = new GitLabPoller({
                gitlabClient: mockGitlabClient,
                db: mockDb,
                notifier: mockNotifier,
                config: mockConfig,
                validateConfig: mockValidateConfig,
                logger: mockLogger,
                reviewerId: 'options-reviewer-id'
            });

            // Assert
            expect(pollerWithReviewerId.reviewerId).toBe('options-reviewer-id');
        });
    });
});

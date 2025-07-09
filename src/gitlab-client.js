const axios = require('axios');
const { config } = require('./config');

class GitLabClient {
  constructor() {
    this.client = axios.create({
      baseURL: `${config.gitlab.baseUrl}/api/v4`,
      headers: {
        'PRIVATE-TOKEN': config.gitlab.accessToken,
      },
    });
    this.lastEventId = null;
  }

  async getProjectEvents() {
    try {
      const response = await this.client.get(`/projects/${config.gitlab.projectId}/events`, {
        params: {
          per_page: 100,
          sort: 'desc',
        },
      });

      const events = response.data;
      
      // Filter only new events if we have a lastEventId
      if (this.lastEventId) {
        const lastEventIndex = events.findIndex(event => event.id === this.lastEventId);
        if (lastEventIndex !== -1) {
          return events.slice(0, lastEventIndex);
        }
      }

      // Update lastEventId with the newest event
      if (events.length > 0) {
        this.lastEventId = events[0].id;
      }

      return events;
    } catch (error) {
      console.error('Error fetching GitLab events:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  async getAllEvents() {
    try {
      const response = await this.client.get(`/events`, {
        params: {
          per_page: 100,
          sort: 'desc',
        },
      });

      const events = response.data;
      
      // Filter only new events if we have a lastEventId
      if (this.lastEventId) {
        const lastEventIndex = events.findIndex(event => event.id === this.lastEventId);
        if (lastEventIndex !== -1) {
          return events.slice(0, lastEventIndex);
        }
      }

      // Update lastEventId with the newest event
      if (events.length > 0) {
        this.lastEventId = events[0].id;
      }

      return events;
    } catch (error) {
      console.error('Error fetching all GitLab events:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  async getMergeRequestsByReviewer(reviewerUsername) {
    try {
      // First, get the user ID from username
      const userResponse = await this.client.get('/users', {
        params: {
          username: reviewerUsername,
        },
      });

      if (!userResponse.data || userResponse.data.length === 0) {
        throw new Error(`User with username '${reviewerUsername}' not found`);
      }

      const userId = userResponse.data[0].id;

      // Get merge requests where this user is a reviewer
      const mergeRequests = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await this.client.get('/merge_requests', {
          params: {
            state: 'opened',
            reviewer_id: userId,
            per_page: 100,
            page: page,
            order_by: 'updated_at',
            sort: 'desc',
          },
        });

        if (response.data.length === 0) {
          hasMore = false;
        } else {
          mergeRequests.push(...response.data);
          page++;
          
          // Check if we've reached the last page
          const totalPages = parseInt(response.headers['x-total-pages'] || '1');
          if (page > totalPages) {
            hasMore = false;
          }
        }
      }

      return mergeRequests;
    } catch (error) {
      console.error('Error fetching merge requests by reviewer:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  async getProjectMergeRequestsByReviewer(projectId, reviewerUsername) {
    try {
      // First, get the user ID from username
      const userResponse = await this.client.get('/users', {
        params: {
          username: reviewerUsername,
        },
      });

      if (!userResponse.data || userResponse.data.length === 0) {
        throw new Error(`User with username '${reviewerUsername}' not found`);
      }

      const userId = userResponse.data[0].id;

      // Get merge requests for specific project where this user is a reviewer
      const response = await this.client.get(`/projects/${projectId}/merge_requests`, {
        params: {
          state: 'opened',
          reviewer_id: userId,
          per_page: 100,
          order_by: 'updated_at',
          sort: 'desc',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching project merge requests by reviewer:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }
}

module.exports = GitLabClient;
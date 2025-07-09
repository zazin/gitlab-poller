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
  }

  async getMergeRequestsByReviewer(reviewerUsername) {
    try {
      // Get merge requests where this user is a reviewer
      const mergeRequests = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await this.client.get('/groups/telkomsel/merge_requests', {
          params: {
            state: 'opened',
            reviewer_username: reviewerUsername,
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

}

module.exports = GitLabClient;
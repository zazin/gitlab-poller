require('dotenv').config();

const config = {
  gitlab: {
    baseUrl: process.env.GITLAB_BASE_URL || 'https://gitlab.com',
    accessToken: process.env.GITLAB_ACCESS_TOKEN,
    projectId: process.env.GITLAB_PROJECT_ID || null, // Optional for multi-project setups
    pollingInterval: parseInt(process.env.POLLING_INTERVAL || '1', 10) * 60 * 1000, // Convert minutes to milliseconds, default 1 minute
  },
};

function validateConfig() {
  const required = [
    ['GITLAB_ACCESS_TOKEN', config.gitlab.accessToken],
  ];

  const missing = required.filter(([name, value]) => !value);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.map(([name]) => name).join(', ')}`
    );
  }
}

module.exports = {
  config,
  validateConfig,
};
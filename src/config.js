require('dotenv').config();

const config = {
  gitlab: {
    baseUrl: process.env.GITLAB_BASE_URL || 'https://gitlab.com',
    accessToken: process.env.GITLAB_ACCESS_TOKEN,
    projectId: process.env.GITLAB_PROJECT_ID || null, // Optional for multi-project setups
    pollingInterval: parseInt(process.env.POLLING_INTERVAL || '1', 10) * 60 * 1000, // Convert minutes to milliseconds, default 1 minute
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    tableName: 'gitlab_events',
    schema: process.env.SUPABASE_SCHEMA || 'public',
  },
};

function validateConfig() {
  const required = [
    ['GITLAB_ACCESS_TOKEN', config.gitlab.accessToken],
    ['SUPABASE_URL', config.supabase.url],
    ['SUPABASE_SECRET_KEY', config.supabase.secretKey],
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
const fs = require('fs');
const path = require('path');
const os = require('os');
const dotenv = require('dotenv');

// Load from home directory .env file
const homeEnvPath = path.join(os.homedir(), '.gitlab-poller', '.env');
if (fs.existsSync(homeEnvPath)) {
  dotenv.config({ path: homeEnvPath });
  console.log(`[config] Loaded configuration from ${homeEnvPath}`);
} else {
  // Fallback to local .env for backward compatibility
  dotenv.config();
}

// Function to load config from old config file format (for backward compatibility)
function loadConfigFromFile() {
  const configPath = path.join(os.homedir(), '.gitlab-poller', 'config');

  if (fs.existsSync(configPath)) {
    try {
      const fileContent = fs.readFileSync(configPath, 'utf8');
      const fileConfig = {};

      // Parse the config file (key=value format)
      fileContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            fileConfig[key.trim()] = valueParts.join('=').trim();
          }
        }
      });

      console.log(`[config] Loaded configuration from ${configPath} (legacy format)`);
      return fileConfig;
    } catch (error) {
      console.warn(`[config] Failed to read config file: ${error.message}`);
      return {};
    }
  }

  return {};
}

// Load file config (for backward compatibility)
const fileConfig = loadConfigFromFile();

// Merge configurations: file config overrides env vars
const config = {
  gitlab: {
    baseUrl: fileConfig.GITLAB_BASE_URL || process.env.GITLAB_BASE_URL || 'https://gitlab.com',
    accessToken: fileConfig.GITLAB_ACCESS_TOKEN || process.env.GITLAB_ACCESS_TOKEN,
    groupId: fileConfig.GITLAB_GROUP_ID || process.env.GITLAB_GROUP_ID,
    reviewerId: fileConfig.GITLAB_REVIEWER_ID || process.env.GITLAB_REVIEWER_ID,
    pollingInterval: parseInt(fileConfig.POLLING_INTERVAL || process.env.POLLING_INTERVAL || '1', 10) * 60 * 1000, // Convert minutes to milliseconds, default 1 minute
  },
};

function validateConfig() {
  const required = [
    ['GITLAB_ACCESS_TOKEN', config.gitlab.accessToken],
    ['GITLAB_GROUP_ID', config.gitlab.groupId],
    ['GITLAB_REVIEWER_ID', config.gitlab.reviewerId],
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

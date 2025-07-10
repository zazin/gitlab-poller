#!/usr/bin/env node

const Setup = require('../src/setup');
const setup = new Setup();

const args = process.argv.slice(2);

// Check if this is a setup command
if (args[0] === 'setup') {
  setup.run().then(success => {
    process.exit(success ? 0 : 1);
  });
  return;
}

// Check if configuration exists
if (!setup.isConfigured() && args[0] !== 'help' && args[0] !== 'version') {
  console.log('⚠️  No configuration found. Running setup wizard...\n');
  setup.run().then(success => {
    if (success) {
      console.log('\nSetup completed! Run the command again to start the poller.\n');
    }
    process.exit(success ? 0 : 1);
  });
  return;
}

if (args.length === 0) {
  // Automatically run the start command when no arguments are provided
  const GitLabPoller = require('../src/poller');
  const poller = new GitLabPoller();

  console.log('Starting GitLab poller automatically...');

  poller.start().catch(error => {
    console.error('Failed to start poller:', error.message);
    process.exit(1);
  });
  return; // Return to prevent executing the switch statement
}

const command = args[0];

switch (command) {
  case 'start':
    const GitLabPoller = require('../src/poller');
    const poller = new GitLabPoller();

    poller.start().catch(error => {
      console.error('Failed to start poller:', error.message);
      process.exit(1);
    });
    break;

  case 'help':
    console.log('Usage: gitlab-poller [command] [options]');
    console.log('\nAvailable commands:');
    console.log('  start                      Start polling GitLab events');
    console.log('  setup                      Run the configuration setup wizard');
    console.log('  help                       Show this help message');
    console.log('  version                    Show version information');
    console.log('\nConfiguration:');
    console.log('  On first run, the setup wizard will guide you through configuration.');
    console.log('  Configuration is stored in: ~/.gitlab-poller/.env');
    console.log('\nRequired configuration:');
    console.log('  GITLAB_ACCESS_TOKEN        Your GitLab personal access token');
    console.log('  GITLAB_GROUP_ID            ID of the GitLab group to poll');
    console.log('  GITLAB_BASE_URL            GitLab base URL');
    console.log('\nOptional configuration:');
    console.log('  POLLING_INTERVAL           Polling interval in minutes (default: 1)');
    break;

  case 'version':
    const package = require('../package.json');
    console.log(`gitlab-poller v${package.version}`);
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.log('Run "gitlab-poller help" for usage information.');
    process.exit(1);
}

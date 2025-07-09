#!/usr/bin/env node

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: gitlab-poller [command] [options]');
  console.log('\nAvailable commands:');
  console.log('  start                      Start polling GitLab events');
  console.log('  merge-requests <username>  Poll open merge requests for a reviewer');
  console.log('  migrate                    Run database migrations');
  console.log('  help                       Show this help message');
  console.log('  version                    Show version information');
  console.log('\nEnvironment variables required:');
  console.log('  GITLAB_ACCESS_TOKEN  Your GitLab personal access token');
  console.log('  SUPABASE_URL         Your Supabase project URL');
  console.log('  SUPABASE_SECRET_KEY  Your Supabase secret key');
  console.log('\nOptional environment variables:');
  console.log('  GITLAB_BASE_URL      GitLab instance URL (default: https://gitlab.com)');
  console.log('  GITLAB_PROJECT_ID    GitLab project ID (optional, polls all accessible if not set)');
  console.log('  POLLING_INTERVAL     Polling interval in minutes (default: 1)');
  process.exit(0);
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

  case 'merge-requests':
    if (args.length < 2) {
      console.error('Error: Reviewer username is required');
      console.log('Usage: gitlab-poller merge-requests <username>');
      process.exit(1);
    }
    
    const MergeRequestPoller = require('../src/merge-request-poller');
    const mrPoller = new MergeRequestPoller();
    const reviewerUsername = args[1];
    
    mrPoller.start(reviewerUsername).catch(error => {
      console.error('Failed to start merge request poller:', error.message);
      process.exit(1);
    });
    break;

  case 'migrate':
    const SupabaseClient = require('../src/supabase-client');
    const migrationClient = new SupabaseClient();
    
    console.log('Running database migrations...');
    migrationClient.runMigrations().then(success => {
      if (success) {
        console.log('Migration completed successfully');
        process.exit(0);
      } else {
        console.error('Migration failed');
        process.exit(1);
      }
    }).catch(error => {
      console.error('Migration error:', error.message);
      process.exit(1);
    });
    break;

  case 'help':
    console.log('Usage: gitlab-poller [command] [options]');
    console.log('\nAvailable commands:');
    console.log('  start                      Start polling GitLab events');
    console.log('  merge-requests <username>  Poll open merge requests for a reviewer');
    console.log('  migrate                    Run database migrations');
    console.log('  help                       Show this help message');
    console.log('  version                    Show version information');
    console.log('\nEnvironment variables required:');
    console.log('  GITLAB_ACCESS_TOKEN  Your GitLab personal access token');
    console.log('  SUPABASE_URL         Your Supabase project URL');
    console.log('  SUPABASE_SECRET_KEY  Your Supabase secret key');
    console.log('\nOptional environment variables:');
    console.log('  GITLAB_BASE_URL      GitLab instance URL (default: https://gitlab.com)');
    console.log('  GITLAB_PROJECT_ID    GitLab project ID (optional, polls all accessible if not set)');
    console.log('  POLLING_INTERVAL     Polling interval in minutes (default: 1)');
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
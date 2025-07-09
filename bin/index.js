#!/usr/bin/env node

console.log('Welcome to gitlab-poller!');
console.log('This is your CLI app running via npx.');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\nUsage: gitlab-poller [command] [options]');
  console.log('\nAvailable commands:');
  console.log('  help     Show this help message');
  console.log('  version  Show version information');
  process.exit(0);
}

const command = args[0];

switch (command) {
  case 'help':
    console.log('\nUsage: gitlab-poller [command] [options]');
    console.log('\nAvailable commands:');
    console.log('  help     Show this help message');
    console.log('  version  Show version information');
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
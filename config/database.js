const path = require('path');
const os = require('os');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.join(os.homedir(), '.gitlab-poller', 'db.sqlite'),
    logging: false
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    dialect: 'sqlite',
    storage: path.join(os.homedir(), '.gitlab-poller', 'db.sqlite'),
    logging: false
  }
};

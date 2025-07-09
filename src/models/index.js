const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const os = require('os');
const basename = path.basename(__filename);
const config = {
  dialect: 'sqlite',
  storage: path.join(os.homedir(), '.gitlab-poller', 'db.sqlite'),
  logging: false
};

const db = {};

const sequelize = new Sequelize(config);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

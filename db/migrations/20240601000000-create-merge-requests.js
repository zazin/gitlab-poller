'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('merge_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      iid: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      state: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      web_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      source_branch: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      target_branch: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });

    // Add unique constraint
    await queryInterface.addIndex('merge_requests', ['iid', 'project_id'], {
      unique: true,
      name: 'merge_requests_iid_project_id_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('merge_requests');
  }
};
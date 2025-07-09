const path = require('path');
const fs = require('fs');
const os = require('os');
const { Sequelize } = require('sequelize');
const db = require('./models');

class DatabaseManager {
  constructor() {
    this.dbPath = path.join(os.homedir(), '.gitlab-poller', 'db.sqlite');
    this.ensureDatabaseDirectory();
    this.sequelize = db.sequelize;
    this.MergeRequest = db.MergeRequest;
    this.initializeDatabase();
  }

  ensureDatabaseDirectory() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async initializeDatabase() {
    // Sync the model with the database
    // This will create the table if it doesn't exist
    await this.sequelize.sync();
  }

  async saveMergeRequest(mergeRequest) {
    try {
      const result = await this.MergeRequest.upsert({
        id: mergeRequest.id,
        iid: mergeRequest.iid,
        project_id: mergeRequest.project_id,
        title: mergeRequest.title,
        description: mergeRequest.description || '',
        state: mergeRequest.state,
        created_at: mergeRequest.created_at,
        updated_at: mergeRequest.updated_at,
        web_url: mergeRequest.web_url,
        source_branch: mergeRequest.source_branch,
        target_branch: mergeRequest.target_branch,
        author_id: mergeRequest.author.id,
        data: JSON.stringify(mergeRequest)
      });
      return result[0]; // Return the model instance
    } catch (error) {
      console.error('Error saving merge request:', error);
      throw error;
    }
  }

  async getMergeRequest(id) {
    try {
      const mergeRequest = await this.MergeRequest.findByPk(id);
      return mergeRequest ? mergeRequest.get({ plain: true }) : null;
    } catch (error) {
      console.error('Error getting merge request:', error);
      throw error;
    }
  }

  async getAllMergeRequests() {
    try {
      const mergeRequests = await this.MergeRequest.findAll();
      return mergeRequests.map(mr => mr.get({ plain: true }));
    } catch (error) {
      console.error('Error getting all merge requests:', error);
      throw error;
    }
  }

  async getMergeRequestByProjectAndIid(projectId, iid) {
    try {
      const mergeRequest = await this.MergeRequest.findOne({
        where: {
          project_id: projectId,
          iid: iid
        }
      });
      return mergeRequest ? mergeRequest.get({ plain: true }) : null;
    } catch (error) {
      console.error('Error getting merge request by project and iid:', error);
      throw error;
    }
  }

  async close() {
    if (this.sequelize) {
      await this.sequelize.close();
    }
  }
}

module.exports = new DatabaseManager();

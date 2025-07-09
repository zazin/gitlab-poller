module.exports = (sequelize, DataTypes) => {
  const MergeRequest = sequelize.define('MergeRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    iid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    state: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    web_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    source_branch: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    target_branch: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'merge_requests',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['iid', 'project_id']
      }
    ]
  });

  return MergeRequest;
};
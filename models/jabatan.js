'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class jabatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  jabatan.init({
    kd_jbtn: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nm_jbtn: DataTypes.STRING,
    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'jabatan',
    tableName: 'jabatan',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return jabatan;
};
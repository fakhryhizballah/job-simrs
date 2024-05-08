'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class spesialis extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  spesialis.init({
    kd_sps: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nm_sps: DataTypes.STRING,

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'spesialis',
    tableName: 'spesialis',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return spesialis;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class spesialis extends Model {

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
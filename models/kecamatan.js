'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kecamatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  kecamatan.init({
    kd_kec: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nm_kec: DataTypes.STRING,

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'kecamatan',
    tableName: 'kecamatan',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return kecamatan;
};
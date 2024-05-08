'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kelurahan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  kelurahan.init({
    kd_kel: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nm_kel: DataTypes.STRING,

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'kelurahan',
    tableName: 'kelurahan',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return kelurahan;
};
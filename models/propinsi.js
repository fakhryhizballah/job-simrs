'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class propinsi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  propinsi.init({
    kd_prop: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nm_prop: DataTypes.STRING,

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'propinsi',
    tableName: 'propinsi',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return propinsi;
};
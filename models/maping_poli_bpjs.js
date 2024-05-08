'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class maping_poli_bpjs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  maping_poli_bpjs.init({
    kd_poli_rs: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    kd_poli_bpjs: DataTypes.STRING,
    nm_poli_bpjs: DataTypes.STRING

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'maping_poli_bpjs',
    tableName: 'maping_poli_bpjs',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return maping_poli_bpjs;
};
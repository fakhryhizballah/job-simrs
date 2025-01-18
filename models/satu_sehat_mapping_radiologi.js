'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class satu_sehat_mapping_radiologi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  satu_sehat_mapping_radiologi.init({
    kd_jenis_prw: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    code: DataTypes.STRING,
    system: DataTypes.STRING,
    display: DataTypes.STRING,
    sampel_code: DataTypes.STRING,
    sampel_system: DataTypes.STRING,
    sampel_display: DataTypes.STRING,
    // tgl_lahir: DataTypes.DATE,
    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'satu_sehat_mapping_radiologi',
    tableName: 'satu_sehat_mapping_radiologi',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return satu_sehat_mapping_radiologi;
};
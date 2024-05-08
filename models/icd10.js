'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class icd10 extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    
  }
  icd10.init({
    kd_penyakit: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nm_penyakit: DataTypes.STRING,
    ciri_ciri: DataTypes.TEXT,
    kd_ktg: DataTypes.STRING,
    status: DataTypes.ENUM('Menular','Tidak Menular'),

  }, {
    sequelize,
    modelName: 'icd10',
    tableName: 'penyakit',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    
    
   
  });
  return icd10;
};
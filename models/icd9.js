'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class icd9 extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    
  }
  icd9.init({
    kode: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    deskripsi_pendek: DataTypes.STRING,
    deskripsi_panjang: DataTypes.STRING,

  }, {
    sequelize,
    modelName: 'icd9',
    tableName: 'icd9',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    
    
   
  });
  return icd9;
};
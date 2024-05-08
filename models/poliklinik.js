'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class poliklinik extends Model {
      /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
      static associate(models) {
        poliklinik.hasMany(models.jadwal, {
          as: 'jadwal',
          foreignKey: 'kd_poli',
        });
        poliklinik.hasMany(models.reg_periksa, {
          as: 'reg_periksa',
          foreignKey: 'kd_poli',
        });
      }
  }
  poliklinik.init({
    kd_poli: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nm_poli: DataTypes.STRING,
   
  }, {
    sequelize,
    modelName: 'poliklinik',
    tableName: 'poliklinik',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    
    
   
  });
  return poliklinik;
}
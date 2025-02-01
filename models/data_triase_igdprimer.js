'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class data_triase_igdprimer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      data_triase_igdprimer.belongsTo(models.satu_sehat_encounter, {
        as: 'encounter',
        foreignKey: 'no_rawat',
      })
      data_triase_igdprimer.belongsTo(models.pegawai, {
        as: 'pegawai',
        foreignKey: 'nik',
        sourceKey: 'nik',
      });
    }

  }
  data_triase_igdprimer.init({
    no_rawat: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    keluhan_utama: DataTypes.STRING,
    kebutuhan_khusus: DataTypes.ENUM('-', 'UPPA', 'Airborne', 'Dekontaminan'),
    catatan: DataTypes.STRING,
    plan: DataTypes.ENUM('Ruang Resusitasi', 'Ruang Kritis'),
    tanggaltriase: DataTypes.DATE,
    nik: DataTypes.STRING,

  }, {
    sequelize,
    modelName: 'data_triase_igdprimer',
    tableName: 'data_triase_igdprimer',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return data_triase_igdprimer;
};
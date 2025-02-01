'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class penilaian_awal_keperawatan_igd extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      penilaian_awal_keperawatan_igd.belongsTo(models.satu_sehat_encounter, {
        as: 'encounter',
        foreignKey: 'no_rawat',
      })
      penilaian_awal_keperawatan_igd.belongsTo(models.pegawai, {
        as: 'pegawai',
        foreignKey: 'nip',
        sourceKey: 'nik',
      });
    }

  }
  penilaian_awal_keperawatan_igd.init({
    no_rawat: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    tanggal: DataTypes.DATE,
    informasi: DataTypes.ENUM('Autoanamnesis', 'Alloanamnesis'),
    keluhan_utama: DataTypes.STRING,
    status_kehamilan: DataTypes.ENUM('Tidak Hamil', 'Hamil'),
    rencana: DataTypes.TEXT,
    nip: DataTypes.STRING,

  }, {
    sequelize,
    modelName: 'penilaian_awal_keperawatan_igd',
    tableName: 'penilaian_awal_keperawatan_igd',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return penilaian_awal_keperawatan_igd;
};
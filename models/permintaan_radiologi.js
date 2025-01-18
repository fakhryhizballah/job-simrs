'use strict';
const { model } = require('mongoose');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class permintaan_radiologi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      permintaan_radiologi.belongsTo(models.satu_sehat_encounter, {
        as: 'encounter',
        foreignKey: 'no_rawat',
        sourceKey: 'no_rawat',
      });
      permintaan_radiologi.hasOne(models.permintaan_pemeriksaan_radiologi, {
        foreignKey: 'noorder',
        sourceKey: 'noorder',
      });
      permintaan_radiologi.belongsTo(models.pegawai, {
        as: 'pegawai',
        foreignKey: 'dokter_perujuk',
        sourceKey: 'nik',
      });

    }

  }
  permintaan_radiologi.init({
    noorder: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    no_rawat: DataTypes.STRING,
    tgl_permintaan: DataTypes.DATEONLY,
    jam_permintaan: DataTypes.TIME,
    tgl_sampel: DataTypes.DATEONLY,
    jam_sampel: DataTypes.TIME,
    tgl_hasil: DataTypes.DATEONLY,
    jam_hasil: DataTypes.TIME,
    dokter_perujuk: DataTypes.STRING,
    status: DataTypes.ENUM('ralan', 'ranap'),
    informasi_tambahan: DataTypes.STRING,
    diagnosa_klinis: DataTypes.STRING,
    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'permintaan_radiologi',
    tableName: 'permintaan_radiologi',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return permintaan_radiologi;
};
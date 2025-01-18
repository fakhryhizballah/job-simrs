'use strict';
const { model } = require('mongoose');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class permintaan_pemeriksaan_radiologi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      permintaan_pemeriksaan_radiologi.hasOne(models.satu_sehat_mapping_radiologi, {
        sourceKey: 'kd_jenis_prw',
        foreignKey: 'kd_jenis_prw',
      })
      permintaan_pemeriksaan_radiologi.belongsTo(models.jns_perawatan_radiologi, {
        sourceKey: 'kd_jenis_prw',
        foreignKey: 'kd_jenis_prw',
      })
    }

  }
  permintaan_pemeriksaan_radiologi.init({
    noorder: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    kd_jenis_prw: DataTypes.STRING,
    stts_bayar: DataTypes.ENUM('Sudah', 'Belum'),
    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'permintaan_pemeriksaan_radiologi',
    tableName: 'permintaan_pemeriksaan_radiologi',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return permintaan_pemeriksaan_radiologi;
};
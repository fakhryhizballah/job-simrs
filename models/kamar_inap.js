'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kamar_inap extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      kamar_inap.hasOne(models.kamar, {
        foreignKey: 'kd_kamar',
        sourceKey: 'kd_kamar',
        as: 'kode_kamar'
      });
      kamar_inap.hasOne(models.reg_periksa, {
        foreignKey: 'no_rawat',
        sourceKey: 'no_rawat',
        as: 'reg_periksa'
      });
    }
    
  }
  kamar_inap.init({
    no_rawat: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    tgl_masuk: {
      type: DataTypes.DATE,
      primaryKey: true,
    },
    jam_masuk: {
      type: DataTypes.TIME,
      primaryKey: true,
    },
    tgl_keluar: DataTypes.DATE,
    jam_keluar: DataTypes.TIME,
    trf_kamar: DataTypes.DOUBLE,
    lama: DataTypes.DOUBLE,
    ttl_biaya: DataTypes.DOUBLE,
    diagnosa_awal: DataTypes.STRING,
    kd_kamar: DataTypes.STRING,
    diagnosa_akhir: DataTypes.STRING,
    stts_pulang: DataTypes.ENUM('Sehat','Rujuk','APS','+','Meninggal','Sembuh','Membaik','Pulang Paksa','-','Pindah Kamar','Status Belum Lengkap','Atas Persetujuan Dokter','Atas Permintaan Sendiri','Isoman','Lain-lain'),
  }, {
    sequelize,
    modelName: 'kamar_inap',
    tableName: 'kamar_inap',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    
    
   
  });
  return kamar_inap;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reg_periksa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Food_variant.hasOne(models.Foods, {
      //   foreignKey: 'id',
      //   sourceKey: 'food_id',
      //   as: 'category'
      // });
      reg_periksa.hasOne(models.pasien, {
        foreignKey: 'no_rkm_medis',
        sourceKey: 'no_rkm_medis',
        as: 'pasien'
      });
      reg_periksa.hasOne(models.dokter, {
        foreignKey: 'kd_dokter',
        sourceKey: 'kd_dokter',
        as: 'dokter'
      });
      reg_periksa.hasMany(models.kamar_inap, {
        foreignKey: 'no_rawat',
        sourceKey: 'no_rawat',
        as: 'kamar_inap'
      });
      reg_periksa.hasOne(models.poliklinik, {
        foreignKey: 'kd_poli',
        sourceKey: 'kd_poli',
        as: 'poliklinik'
      });
      reg_periksa.hasOne(models.penjab, {
        foreignKey: 'kd_pj',
        sourceKey: 'kd_pj',
        as: 'penjab'
      });
      reg_periksa.hasMany(models.diagnosa_pasien, {
        foreignKey: 'no_rawat',
        sourceKey: 'no_rawat',
        as: 'diagnosa_pasien'
      });
      reg_periksa.hasOne(models.maping_dokter_dpjpvclaim, {
        foreignKey: 'kd_dokter',
        sourceKey: 'kd_dokter',
        as: 'maping_dokter_dpjpvclaim'
      });
      reg_periksa.hasOne(models.maping_poli_bpjs, {
        foreignKey: 'kd_poli_rs',
        sourceKey: 'kd_poli',
        as: 'maping_poli_bpjs'
      });
      reg_periksa.hasOne(models.bridging_sep, {
        foreignKey: 'no_rawat',
        sourceKey: 'no_rawat',
        as: 'bridging_sep'
      });

    }

  }
  reg_periksa.init({
    no_reg: DataTypes.STRING,
    no_rawat: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    tgl_registrasi: DataTypes.DATEONLY,
    jam_reg: DataTypes.TIME,
    kd_dokter: DataTypes.STRING,
    no_rkm_medis: DataTypes.STRING,
    kd_poli: DataTypes.STRING,
    p_jawab: DataTypes.STRING,
    almt_pj: DataTypes.STRING,
    hubunganpj: DataTypes.STRING,
    biaya_reg: DataTypes.STRING,
    stts: DataTypes.ENUM('Belum','Sudah','Batal','Berkas Diterima','Dirujuk','Meninggal','Dirawat','Pulang Paksa'),
    stts_daftar: DataTypes.ENUM('-', 'Lama', 'Baru'),
    status_lanjut: DataTypes.ENUM('Ralan', 'Ranap'),
    kd_pj: DataTypes.STRING,
    umurdaftar: DataTypes.INTEGER,
    sttsumur: DataTypes.ENUM('Th','Bl','Hr'),
    status_poli: DataTypes.ENUM('Lama', 'Baru')
  }, {
    sequelize,
    modelName: 'reg_periksa',
    tableName: 'reg_periksa',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return reg_periksa;
};
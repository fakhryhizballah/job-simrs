'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pasien extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pasien.hasMany(models.reg_periksa, {
        foreignKey: 'no_rkm_medis',
        sourceKey: 'no_rkm_medis',
        as: 'reg_periksa'
      });
      pasien.hasOne(models.kelurahan, {
        foreignKey: 'kd_kel',
        sourceKey: 'kd_kel',
        as: 'kelurahan'
      });
      pasien.hasOne(models.kecamatan, {
        foreignKey: 'kd_kec',
        sourceKey: 'kd_kec',
        as: 'kecamatan'
      });
      pasien.hasOne(models.kabupaten, {
        foreignKey: 'kd_kab',
        sourceKey: 'kd_kab',
        as: 'kabupaten/kota'
      });
      pasien.hasOne(models.penjab, {
        foreignKey: 'kd_pj',
        sourceKey: 'kd_pj',
      });
    }
    

  }
  pasien.init({
    no_rkm_medis: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nm_pasien: DataTypes.STRING,
    tgl_lahir: DataTypes.DATE,
    tmp_lahir: DataTypes.STRING,
    jk: DataTypes.ENUM('L', 'P'),
    no_ktp: DataTypes.STRING,
    kd_pj: DataTypes.STRING,
    no_peserta: DataTypes.STRING,
    no_tlp: DataTypes.STRING,
    tgl_daftar: DataTypes.DATE,
    alamat: DataTypes.STRING,
    kd_kel: DataTypes.INTEGER,
    kd_kec: DataTypes.INTEGER,
    kd_kab: DataTypes.INTEGER,
    pekerjaan: DataTypes.STRING,
    agama: DataTypes.STRING,
    nm_ibu: DataTypes.STRING,
    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
     // If don't want createdAt
  }, {
    sequelize,
    modelName: 'pasien',
    tableName: 'pasien',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    
    
   
  });
  return pasien;
};
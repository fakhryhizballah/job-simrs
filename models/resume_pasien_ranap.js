'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class resume_pasien_ranap extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  resume_pasien_ranap.init({
    no_rawat: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    kd_dokter: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    diagnosa_awal: DataTypes.STRING,
    alasan: DataTypes.STRING,
    keluhan_utama: DataTypes.STRING,
    pemeriksaan_fisik: DataTypes.STRING,
    jalannya_penyakit: DataTypes.STRING,
    pemeriksaan_penunjang: DataTypes.STRING,
    hasil_laborat: DataTypes.STRING,
    tindakan_dan_operasi: DataTypes.STRING,
    obat_di_rs: DataTypes.STRING,
    diagnosa_utama: DataTypes.STRING,
    kd_diagnosa_utama: DataTypes.STRING,
    diagnosa_sekunder: DataTypes.STRING,
    kd_diagnosa_sekunder: DataTypes.STRING,
    diagnosa_sekunder2: DataTypes.STRING,
    kd_diagnosa_sekunder2: DataTypes.STRING,
    diagnosa_sekunder3: DataTypes.STRING,
    kd_diagnosa_sekunder3: DataTypes.STRING,
    diagnosa_sekunder4: DataTypes.STRING,
    kd_diagnosa_sekunder4: DataTypes.STRING,
    prosedur_utama: DataTypes.STRING,
    kd_prosedur_utama: DataTypes.STRING,
    prosedur_sekunder: DataTypes.STRING,
    kd_prosedur_sekunder: DataTypes.STRING,
    prosedur_sekunder2: DataTypes.STRING,
    kd_prosedur_sekunder2: DataTypes.STRING,
    prosedur_sekunder3: DataTypes.STRING,
    kd_prosedur_sekunder3: DataTypes.STRING,
    alergi: DataTypes.STRING,
    diet: DataTypes.STRING,
    lab_belum: DataTypes.STRING,
    edukasi: DataTypes.STRING,
    cara_keluar: DataTypes.STRING,
    ket_keluar: DataTypes.STRING,
    keadaan: DataTypes.STRING,
    ket_keadaan: DataTypes.STRING,
    dilanjutkan: DataTypes.STRING,
    ket_dilanjutkan: DataTypes.STRING,
    kontrol: DataTypes.STRING,
    obat_pulang: DataTypes.STRING

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'resume_pasien_ranap',
    tableName: 'resume_pasien_ranap',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return resume_pasien_ranap;
};
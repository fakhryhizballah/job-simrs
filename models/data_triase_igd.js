'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class data_triase_igd extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      data_triase_igd.belongsTo(models.satu_sehat_encounter, {
        as: 'encounter',
        foreignKey: 'no_rawat',
      })
    }

  }
  data_triase_igd.init({
    no_rawat: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    tgl_kunjungan: DataTypes.DATE,
    cara_masuk: DataTypes.ENUM('Jalan', 'Brankar', 'Kursi Roda', 'Digendong'),
    alat_transportasi: DataTypes.ENUM('-', 'AGD', 'Sendiri', 'Swasta'),
    alasan_kedatangan: DataTypes.ENUM('Datang Sendiri', 'Polisi', 'Rujukan', '-'),
    keterangan_kedatangan: DataTypes.STRING,
    kode_kasus: DataTypes.STRING,
    tekanan_darah: DataTypes.STRING,
    nadi: DataTypes.STRING,
    pernapasan: DataTypes.STRING,
    suhu: DataTypes.STRING,
    saturasi_o2: DataTypes.STRING,
    nyeri: DataTypes.STRING,

  }, {
    sequelize,
    modelName: 'data_triase_igd',
    tableName: 'data_triase_igd',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return data_triase_igd;
};
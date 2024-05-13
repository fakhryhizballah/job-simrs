'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class data_batch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  data_batch.init({
    no_batch: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    kode_brng: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    tgl_beli: DataTypes.DATEONLY,
    tgl_kadaluarsa: DataTypes.DATEONLY,
    asal: DataTypes.ENUM('Penerimaan', 'Pengadaan', 'Hibah'),
    no_faktur: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    dasar: DataTypes.DOUBLE,
    h_beli: DataTypes.DOUBLE,
    ralan: DataTypes.DOUBLE,
    kelas1: DataTypes.DOUBLE,
    kelas2: DataTypes.DOUBLE,
    kelas3: DataTypes.DOUBLE,
    utama: DataTypes.DOUBLE,
    vip: DataTypes.DOUBLE,
    vvip: DataTypes.DOUBLE,
    beliluar: DataTypes.DOUBLE,
    jualbebas: DataTypes.DOUBLE,
    karyawan: DataTypes.DOUBLE,
    jumlahbeli: DataTypes.DOUBLE,
    sisa: DataTypes.DOUBLE,

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'data_batch',
    tableName: 'data_batch',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return data_batch;
};
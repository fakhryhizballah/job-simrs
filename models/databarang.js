'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class databarang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  databarang.init({
    kode_brng: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nama_brng: DataTypes.STRING,
    kode_satbesar: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    kode_sat: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    letak_barang: DataTypes.STRING,
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
    stokminimal: DataTypes.DOUBLE,
    kdjns: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    isi: DataTypes.DOUBLE,
    kapasitas: DataTypes.DOUBLE,
    expire: DataTypes.DATE,
    status: DataTypes.ENUM('0', '1'),
    kode_industri: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    kode_kategori: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    kode_golongan: {
      type: DataTypes.STRING,
      primaryKey: true,
    }

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'databarang',
    tableName: 'databarang',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return databarang;
};
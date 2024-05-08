'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class penjab extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  penjab.init({
    kd_pj: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    png_jawab: DataTypes.STRING,
    nama_perusahaan: DataTypes.STRING,
    alamat_asuransi: DataTypes.STRING,
    no_telp: DataTypes.STRING,
    attn: DataTypes.STRING,
    status: DataTypes.ENUM('0','1'),

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'penjab',
    tableName: 'penjab',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return penjab;
};
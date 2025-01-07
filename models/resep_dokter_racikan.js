'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class resep_dokter_racikan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  resep_dokter_racikan.init({
    no_resep: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    no_racik: DataTypes.STRING,
    nama_racik: DataTypes.STRING,
    kd_racik: DataTypes.STRING,
    jml_dr: DataTypes.INTEGER,
    aturan_pakai: DataTypes.STRING,
    keterangan: DataTypes.STRING,

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'resep_dokter_racikan',
    tableName: 'resep_dokter_racikan',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return resep_dokter_racikan;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class jns_perawatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  jns_perawatan.init({
    kd_jenis_prw: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nm_perawatan: DataTypes.STRING,
    kd_kategori: DataTypes.STRING,
    material: DataTypes.DOUBLE,
    bhp: DataTypes.DOUBLE,
    tarif_tindakandr: DataTypes.DOUBLE,
    tarif_tindakanpr: DataTypes.DOUBLE,
    kso: DataTypes.DOUBLE,
    menejemen: DataTypes.DOUBLE,
    total_byrdr: DataTypes.DOUBLE,
    total_byrpr: DataTypes.DOUBLE,
    total_byrdrpr: DataTypes.DOUBLE,
    kd_pj: DataTypes.DOUBLE,
    kd_poli: DataTypes.STRING,
    status: DataTypes.ENUM('1','0'),

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'jns_perawatan',
    tableName: 'jns_perawatan',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return jns_perawatan;
};
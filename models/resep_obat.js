'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class resep_obat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      resep_obat.hasOne(models.resep_dokter_racikan, { foreignKey: 'no_resep' })
    }

  }
  resep_obat.init({
    no_resep: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    tgl_perawatan: DataTypes.DATEONLY,
    jam: DataTypes.TIME,
    no_rawat: DataTypes.STRING,
    kd_dokter: DataTypes.STRING,
    tgl_peresepan: DataTypes.DATEONLY,
    jam_peresepan: DataTypes.TIME,
    status: DataTypes.ENUM('ralan', 'ranap'),
    tgl_penyerahan: DataTypes.DATEONLY,
    jam_penyerahan: DataTypes.TIME,

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'resep_obat',
    tableName: 'resep_obat',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return resep_obat;
};
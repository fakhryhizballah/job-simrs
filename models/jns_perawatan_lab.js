'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class jns_perawatan_lab extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      jns_perawatan_lab.hasMany(models.template_laboratorium, {
        as: 'template_laboratorium',
        foreignKey: 'kd_jenis_prw',
      });
    }

  }
  jns_perawatan_lab.init({
    kd_jenis_prw: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nm_perawatan: DataTypes.STRING,
    bagian_rs: DataTypes.DOUBLE,
    bhp: DataTypes.DOUBLE,
    total_byr: DataTypes.DOUBLE,
    kelas: DataTypes.ENUM('-', 'Rawat Jalan', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas Utama', 'Kelas VIP', 'Kelas VVIP'),
    kategori: DataTypes.ENUM('PK', 'PA', 'MB'),
    status: DataTypes.ENUM('1','0'),

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'jns_perawatan_lab',
    tableName: 'jns_perawatan_lab',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return jns_perawatan_lab;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class data_triase_igdsekunder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      data_triase_igdsekunder.belongsTo(models.satu_sehat_encounter, {
        as: 'encounter',
        foreignKey: 'no_rawat',
      })
      data_triase_igdsekunder.belongsTo(models.pegawai, {
        as: 'pegawai',
        foreignKey: 'nik',
        sourceKey: 'nik',
      });
    }

  }
  data_triase_igdsekunder.init({
    no_rawat: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    anamnesa_singkat: DataTypes.STRING,
    catatan: DataTypes.STRING,
    plan: DataTypes.ENUM('Zona Kuning', 'Zona Hijau'),
    tanggaltriase: DataTypes.DATE,
    nik: DataTypes.STRING,

  }, {
    sequelize,
    modelName: 'data_triase_igdsekunder',
    tableName: 'data_triase_igdsekunder',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return data_triase_igdsekunder;
};
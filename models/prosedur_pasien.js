'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class prosedur_pasien extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      prosedur_pasien.belongsTo(models.icd9, {
        as: 'prosedur',
        foreignKey: 'kode',
        sourceKey: 'kode',
      });
      prosedur_pasien.belongsTo(models.reg_periksa, {
        as: 'reg_periksa',
        foreignKey: 'no_rawat',
        sourceKey: 'no_rawat',
      });
    }

  }
  prosedur_pasien.init({
    no_rawat: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    kode: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM('Ralan', 'Ranap'),
      primaryKey: true,
    },
    prioritas: DataTypes.INTEGER,

  }, {
    sequelize,
    modelName: 'prosedur_pasien',
    tableName: 'prosedur_pasien',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return prosedur_pasien;
};
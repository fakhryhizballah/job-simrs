'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class diagnosa_pasien extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        diagnosa_pasien.belongsTo(models.penyakit, {
          as: 'penyakit',
          foreignKey: 'kd_penyakit',
          sourceKey: 'kd_penyakit',
        });
        diagnosa_pasien.belongsTo(models.reg_periksa, {
          as: 'reg_periksa',
          foreignKey: 'no_rawat',
          sourceKey: 'no_rawat',
        });
    }
    
  }
  diagnosa_pasien.init({
    no_rawat: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    kd_penyakit: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM('Ralan','Ranap'),
      primaryKey: true,
    },
    prioritas: DataTypes.INTEGER,
    status_penyakit: DataTypes.ENUM('Lama','Baru'),

  }, {
    sequelize,
    modelName: 'diagnosa_pasien',
    tableName: 'diagnosa_pasien',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    
    
   
  });
  return diagnosa_pasien;
};
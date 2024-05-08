'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kamar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      kamar.belongsTo(models.bangsal, {
        foreignKey: 'kd_bangsal',
        sourceKey: 'kd_bangsal',
        as: 'bangsal'
      });
    }
    
  }
  kamar.init({
    kd_kamar: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    kd_bangsal: DataTypes.STRING,
    trf_kamar: DataTypes.DOUBLE,
    status: DataTypes.ENUM('ISI','KOSONG','DIBERSIHKAN','DIBOOKING'),
    kelas: DataTypes.ENUM('Kelas 1','Kelas 2','Kelas 3','Kelas Utama','Kelas VIP','Kelas VVIP'),
    statusdata: DataTypes.ENUM('0','1'),
  }, {
    sequelize,
    modelName: 'kamar',
    tableName: 'kamar',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    
    
   
  });
  return kamar;
};
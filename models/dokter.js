'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class dokter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      dokter.belongsTo(models.spesialis, {
        foreignKey: 'kd_sps',
        sourceKey: 'kd_sps',
      });
    }
    
  }
  dokter.init({
    kd_dokter: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nm_dokter: DataTypes.STRING,
    jk: DataTypes.ENUM('L', 'P'),
    // tgl_lahir: DataTypes.DATE,
    no_ijn_praktek: DataTypes.STRING,
    kd_sps: DataTypes.STRING,

  }, {
    sequelize,
    modelName: 'dokter',
    tableName: 'dokter',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    
    
   
  });
  return dokter;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class bangsal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      bangsal.hasMany(models.kamar, {
        foreignKey: 'kd_bangsal',
        sourceKey: 'kd_bangsal',
      });
    }
    
  }
  bangsal.init({
    kd_bangsal: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nm_bangsal: DataTypes.STRING,
    status: DataTypes.ENUM('0','1'),
  }, {
    sequelize,
    modelName: 'bangsal',
    tableName: 'bangsal',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    
    
   
  });
  return bangsal;
};
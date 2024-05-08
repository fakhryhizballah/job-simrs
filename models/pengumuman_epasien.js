'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pengumuman_epasien extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  pengumuman_epasien.init({
    nik: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    tanggal: {
      type: DataTypes.DATE,
      primaryKey: true,
    },
    pengumuman: DataTypes.STRING,

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'pengumuman_epasien',
    tableName: 'pengumuman_epasien',
    timestamps: false,
    createdAt: false,
    updatedAt: false,

  });
  return pengumuman_epasien;
};
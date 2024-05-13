'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class gudangbarang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  gudangbarang.init({
    kode_brng: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    kd_bangsal: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    stok: DataTypes.DOUBLE,
    no_batch: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    no_faktur: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'gudangbarang',
    tableName: 'gudangbarang',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return gudangbarang;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class template_laboratorium extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

  }
  template_laboratorium.init({
    id_template: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    kd_jenis_prw: DataTypes.STRING,
    Pemeriksaan: DataTypes.STRING,
    satuan: DataTypes.STRING,
    nilai_rujukan_ld: DataTypes.STRING,
    nilai_rujukan_la: DataTypes.STRING,
    nilai_rujukan_pd: DataTypes.STRING,
    nilai_rujukan_pa: DataTypes.STRING,
    bagian_rs: DataTypes.DOUBLE,
    bhp: DataTypes.DOUBLE,
    biaya_item: DataTypes.DOUBLE,
    urut: DataTypes.INTEGER,

    // createdAt: { type: DataTypes.DATE, field: 'created_at' },
    // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    // If don't want createdAt
  }, {
    sequelize,
    modelName: 'template_laboratorium',
    tableName: 'template_laboratorium',
    timestamps: false,
    createdAt: false,
    updatedAt: false,



  });
  return template_laboratorium;
};
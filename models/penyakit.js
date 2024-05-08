'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class penyakit extends Model {
        /**
        * Helper method for defining associations.
        * This method is not a part of Sequelize lifecycle.
        * The `models/index` file will call this method automatically.
        */
        static associate(models) {
            penyakit.belongsTo(models.kategori_penyakit, {
                as: 'kategori_penyakit',
                foreignKey: 'kd_ktg',
            });
        }
    }
    penyakit.init({
        kd_penyakit: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        nm_penyakit: DataTypes.STRING,
        ciri_ciri: DataTypes.TEXT,
        keterangan: DataTypes.STRING,
        kd_ktg: DataTypes.STRING,
        status: DataTypes.ENUM('Menular', 'Tidak Menular'),
    }, {
        sequelize,
        modelName: 'penyakit',
        tableName: 'penyakit',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return penyakit;
}
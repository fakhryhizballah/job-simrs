'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class pemeriksaan_ralan extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            pemeriksaan_ralan.hasOne(models.reg_periksa, {
                as: 'reg_periksa',
                foreignKey: 'no_rawat',
            });
            pemeriksaan_ralan.hasOne(models.pegawai, {
                as: 'pegawai',
                foreignKey: 'nik',
                sourceKey: 'nip',
            });
        }
    }
    pemeriksaan_ralan.init({
        no_rawat: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        tgl_perawatan: {
            type: DataTypes.DATEONLY,
            primaryKey: true,
        },
        jam_rawat: {
            type: DataTypes.TIME,
            primaryKey: true,
        },
        suhu_tubuh: DataTypes.STRING,
        tensi: DataTypes.STRING,
        nadi: DataTypes.STRING,
        respirasi: DataTypes.STRING,
        tinggi: DataTypes.STRING,
        berat: DataTypes.STRING,
        spo2: DataTypes.STRING,
        gcs: DataTypes.STRING,
        kesadaran: DataTypes.ENUM('Compos Mentis', 'Somnolence', 'Sopor', 'Coma', 'Alert', 'Confusion', 'Voice', 'Pain', 'Unresponsive'),
        keluhan: DataTypes.TEXT,
        pemeriksaan: DataTypes.TEXT,
        alergi: DataTypes.STRING,
        lingkar_perut: DataTypes.STRING,
        rtl: DataTypes.TEXT,
        penilaian: DataTypes.TEXT,
        instruksi: DataTypes.TEXT,
        evaluasi: DataTypes.TEXT,
        nip: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'pemeriksaan_ralan',
        tableName: 'pemeriksaan_ralan',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return pemeriksaan_ralan;
};

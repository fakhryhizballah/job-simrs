'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class booking_registrasi extends Model {
        /**
        * Helper method for defining associations.
        * This method is not a part of Sequelize lifecycle.
        * The `models/index` file will call this method automatically.
        */
        static associate(models) {
            booking_registrasi.belongsTo(models.dokter, {
                as: 'dokter',
                foreignKey: 'kd_dokter',
            });
            booking_registrasi.belongsTo(models.poliklinik, {
                as: 'poliklinik',
                foreignKey: 'kd_poli',
            });
            booking_registrasi.belongsTo(models.pasien, {
                as: 'pasien',
                foreignKey: 'no_rkm_medis',
            });
            booking_registrasi.belongsTo(models.penjab, {
                as: 'penjab',
                foreignKey: 'kd_pj',
            });
        }
    }
    booking_registrasi.init({
        tanggal_booking: DataTypes.DATEONLY,
        jam_booking: DataTypes.TIME,
        no_rkm_medis: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        tanggal_periksa: {
            type: DataTypes.DATEONLY,
            primaryKey: true,
        },
        kd_dokter: DataTypes.STRING,
        kd_poli: DataTypes.STRING,
        no_reg: DataTypes.STRING,
        kd_pj: DataTypes.STRING,
        limit_reg: DataTypes.INTEGER,
        waktu_kunjungan: DataTypes.DATE,
        status: DataTypes.ENUM('Terdaftar', 'Belum', 'Batal', 'Dokter Berhalangan'),
    }, {
        sequelize,
        modelName: 'booking_registrasi',
        tableName: 'booking_registrasi',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return booking_registrasi;
}
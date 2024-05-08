'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class jadwal extends Model {
        /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
        static associate(models) {
            jadwal.belongsTo(models.dokter, {
                as: 'dokter',
                foreignKey: 'kd_dokter',
            });
            jadwal.belongsTo(models.poliklinik, {
                as: 'poliklinik',
                foreignKey: 'kd_poli',
            });
            jadwal.hasOne(models.pegawai, {
                as: 'pegawai',
                foreignKey: 'nik',
                sourceKey: 'kd_dokter',
            });
        }
    }
    jadwal.init({
        kd_dokter: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        hari_kerja: {
            type: DataTypes.ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'),
        },
        jam_mulai: DataTypes.TIME,
        jam_selesai: DataTypes.TIME,
        kd_poli: DataTypes.STRING,
        kuota: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'jadwal',
        tableName: 'jadwal',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return jadwal;
}
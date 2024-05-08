'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class booking_periksa extends Model {
        /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
        static associate(models) {
            booking_periksa.belongsTo(models.poliklinik, {
                as: 'poliklinik',
                foreignKey: 'kd_poli',
            });
        }
    }
    booking_periksa.init({
        no_booking: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        tanggal: DataTypes.DATE,
        nama: DataTypes.STRING,
        alamat: DataTypes.STRING,
        no_telp: DataTypes.STRING,
        email: DataTypes.STRING,
        kd_poli: DataTypes.STRING,
        tambahan_pesan: DataTypes.STRING,
        status: DataTypes.ENUM('Diterima', 'Ditolak', 'Belum Dibalas'),
        tanggal_booking: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'booking_periksa',
        tableName: 'booking_periksa',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return booking_periksa;
}

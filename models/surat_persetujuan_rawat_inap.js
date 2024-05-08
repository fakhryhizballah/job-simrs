'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class surat_persetujuan_rawat_inap extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            surat_persetujuan_rawat_inap.hasOne(models.petugas, {
                foreignKey: 'nip',
                sourceKey: 'nip',
                as: 'petugas'
            });
            surat_persetujuan_rawat_inap.hasOne(models.reg_periksa, {
                foreignKey: 'no_rawat',
                sourceKey: 'no_rawat',
                as: 'reg_periksa'
            });

        }

    }
    surat_persetujuan_rawat_inap.init({
        no_surat: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        no_rawat: DataTypes.STRING,
        tanggal: DataTypes.DATE,
        nama_pj: DataTypes.STRING,
        no_ktppj: DataTypes.STRING,
        pendidikan_pj: DataTypes.ENUM('TS', 'TK', 'SD', 'SMP', 'SMA', 'SLTA/SEDERAJAT', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3', '-'),
        alamatpj: DataTypes.STRING,
        no_telp: DataTypes.STRING,
        ruang: DataTypes.STRING,
        kelas: DataTypes.ENUM('Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas Utama', 'Kelas VIP', 'Kelas VVIP'),
        hubungan: DataTypes.ENUM('Suami', 'Istri', 'Anak', 'Ayah', 'Ibu', 'Saudara', 'Keponakan', 'Diri Saya'),
        hak_kelas: DataTypes.ENUM('Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas Utama', 'Kelas VIP', 'Kelas VVIP', '-'),
        nama_alamat_keluarga_terdekat: DataTypes.STRING,
        bayar_secara: DataTypes.STRING,
        nip: DataTypes.STRING,



        // createdAt: { type: DataTypes.DATE, field: 'created_at' },
        // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
        // If don't want createdAt
    }, {
        sequelize,
        modelName: 'surat_persetujuan_rawat_inap',
        tableName: 'surat_persetujuan_rawat_inap',
        timestamps: false,
        createdAt: false,
        updatedAt: false,



    });
    return surat_persetujuan_rawat_inap;
};
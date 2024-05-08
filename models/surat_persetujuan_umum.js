'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class surat_persetujuan_umum extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            surat_persetujuan_umum.hasOne(models.petugas, {
                foreignKey: 'nip',
                sourceKey: 'nip',
                as: 'petugas'
            });
            surat_persetujuan_umum.hasOne(models.reg_periksa, {
                foreignKey: 'no_rawat',
                sourceKey: 'no_rawat',
                as: 'reg_periksa'
            });

        }

    }
    surat_persetujuan_umum.init({
        no_surat: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        no_rawat: DataTypes.STRING,
        tanggal: DataTypes.DATE,
        pengobatan_kepada: DataTypes.ENUM('Suami', 'Istri', 'Anak', 'Ayah', 'Ibu', 'Saudara', 'Keponakan', 'Adik', 'Kakak', 'Orang Tua', 'Diri Sendiri', '-'),
        nilai_kepercayaan: DataTypes.STRING,
        nama_pj: DataTypes.STRING,
        umur_pj: DataTypes.STRING,
        no_ktppj: DataTypes.STRING,
        jkpj: DataTypes.ENUM('L', 'P'),
        bertindak_atas: DataTypes.ENUM('Suami', 'Istri', 'Anak', 'Ayah', 'Ibu', 'Saudara', 'Keponakan', 'Diri Sendiri', 'Kakak', 'Adik'),
        no_telp: DataTypes.STRING,
        nip: DataTypes.STRING,

        // createdAt: { type: DataTypes.DATE, field: 'created_at' },
        // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
        // If don't want createdAt
    }, {
        sequelize,
        modelName: 'surat_persetujuan_umum',
        tableName: 'surat_persetujuan_umum',
        timestamps: false,
        createdAt: false,
        updatedAt: false,



    });
    return surat_persetujuan_umum;
};
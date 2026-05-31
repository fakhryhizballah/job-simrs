// models/catatan_adime_gizi.js
'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    class catatan_adime_gizi extends Model {
        /**
         * Helper method for defining associations.
         * This method is automatically called by `models/index.js`.
         */
        static associate(models) {
            // 1. Tabel ini berelasi satu‑ke‑satu (atau many‑to‑one) dengan `reg_periksa` via `no_rawat`
            catatan_adime_gizi.belongsTo(models.reg_periksa, {
                foreignKey: 'no_rawat',
                targetKey: 'no_rawat',
                as: 'regPeriksa'
            });

            // 2. Tabel ini berelasi satu‑ke‑satu (atau many‑to‑one) dengan `petugas` via `nip`
            catatan_adime_gizi.belongsTo(models.pegawai, {
                foreignKey: 'nip',
                targetKey: 'nik',
                as: 'pegawai'
            });
        }
    }

    catatan_adime_gizi.init(
        {
            // Primary key komposisi (no_rawat, tanggal)
            no_rawat: {
                type: DataTypes.STRING(17),
                primaryKey: true,
                allowNull: false
            
            },
            tanggal: {
                type: DataTypes.DATE,
                primaryKey: true,
                allowNull: false
            },
            asesmen: DataTypes.STRING(1000),
            diagnosis: DataTypes.STRING(1000),
            intervensi: DataTypes.STRING(1000),
            monitoring: DataTypes.STRING(1000),
            evaluasi: DataTypes.STRING(1000),
            instruksi: DataTypes.STRING(1000),
            nip: {
                type: DataTypes.STRING(20),
                allowNull: true
            },
        },
        {
            sequelize,
            modelName: 'catatan_adime_gizi',
            tableName: 'catatan_adime_gizi',
            timestamps: false,
            createdAt: false,
            updatedAt: false
        }
    );

    return catatan_adime_gizi;
};
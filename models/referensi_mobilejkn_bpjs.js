'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class referensi_mobilejkn_bpjs extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            referensi_mobilejkn_bpjs.belongsTo(models.reg_periksa, {
                foreignKey: 'no_rawat',
                sourceKey: 'no_rawat',
                as: 'reg_periksa'
            })
        }
    }

    referensi_mobilejkn_bpjs.init({
        nobooking: {
            type: DataTypes.STRING(15),
            primaryKey: true,
            allowNull: false
        },
        no_rawat: {
            type: DataTypes.STRING(17),
            allowNull: true
        },
        nomorkartu: {
            type: DataTypes.STRING(25),
            allowNull: true
        },
        nik: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        nohp: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        kodepoli: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        pasienbaru: {
            type: DataTypes.ENUM('0', '1'),
            allowNull: false
        },
        norm: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        tanggalperiksa: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        kodedokter: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        jampraktek: {
            type: DataTypes.STRING(12),
            allowNull: true
        },
        jeniskunjungan: {
            type: DataTypes.ENUM(
                '1 (Rujukan FKTP)',
                '2 (Rujukan Internal)',
                '3 (Kontrol)',
                '4 (Rujukan Antar RS)'
            ),
            allowNull: true
        },
        nomorreferensi: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
        nomorantrean: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        angkaantrean: {
            type: DataTypes.STRING(5),
            allowNull: false
        },
        estimasidilayani: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        sisakuotajkn: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        kuotajkn: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        sisakuotanonjkn: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        kuotanonjkn: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('Belum', 'Checkin', 'Batal', 'Gagal'),
            allowNull: false
        },
        validasi: {
            type: DataTypes.DATE,
            allowNull: false
        },
        statuskirim: {
            type: DataTypes.ENUM('Belum', 'Sudah'),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'referensi_mobilejkn_bpjs',
        tableName: 'referensi_mobilejkn_bpjs',
        timestamps: false,
        createdAt: false,
        updatedAt: false
    });

    return referensi_mobilejkn_bpjs;
};
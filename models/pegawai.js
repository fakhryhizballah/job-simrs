'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class pegawai extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    pegawai.init({
        nik: {
            type: DataTypes.STRING,
            unique: true,
            primaryKey: true,
        },
        nama: {
            type: DataTypes.STRING
        },
        jk: {
            type: DataTypes.ENUM('Pria', 'Wanita')
        },
        jbtn: {
            type: DataTypes.STRING
        },
        jnj_jabatan: {
            type: DataTypes.STRING
        },
        kode_kelompok: {
            type: DataTypes.STRING
        },
        kode_resiko: {
            type: DataTypes.STRING
        },
        kode_emergency: {
            type: DataTypes.STRING
        },
        departemen: {
            type: DataTypes.STRING
        },
        bidang: {
            type: DataTypes.STRING
        },
        stts_wp: {
            type: DataTypes.STRING
        },
        stts_kerja: {
            type: DataTypes.STRING
        },
        npwp: {
            type: DataTypes.STRING
        },
        pendidikan: {
            type: DataTypes.STRING
        },
        gapok: {
            type: DataTypes.DOUBLE
        },
        tmp_lahir: {
            type: DataTypes.STRING
        },
        tgl_lahir: {
            type: DataTypes.DATEONLY
        },
        alamat: {
            type: DataTypes.STRING
        },
        kota: {
            type: DataTypes.STRING
        },
        mulai_kerja: {
            type: DataTypes.DATEONLY
        },
        ms_kerja: {
            type: DataTypes.ENUM('<1', 'PT', 'FT>1')
        },
        indexins: {
            type: DataTypes.STRING
        },
        bpd: {
            type: DataTypes.STRING
        },
        rekening: {
            type: DataTypes.STRING
        },
        stts_aktif: {
            type: DataTypes.ENUM('AKTIF', 'CUTI', 'KELUAR', 'TENAGA LUAR')
        },
        wajibmasuk: {
            type: DataTypes.INTEGER
        },
        pengurang: {
            type: DataTypes.INTEGER
        },
        indek: {
            type: DataTypes.INTEGER
        },
        mulai_kontrak: {
            type: DataTypes.DATEONLY
        },
        cuti_diambil: {
            type: DataTypes.INTEGER
        },
        dankes: {
            type: DataTypes.INTEGER
        },
        photo: {
            type: DataTypes.STRING
        },
        no_ktp: {
            type: DataTypes.STRING,
            unique: true,
        }
    }, {
        sequelize,
        modelName: 'pegawai',
        tableName: 'pegawai',
        timestamps: false,
        createdAt: false,
        updatedAt: false,

    });
    return pegawai;
};
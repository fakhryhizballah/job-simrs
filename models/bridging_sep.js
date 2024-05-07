'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class bridging_sep extends Model {
        static associate(models) {
            bridging_sep.hasOne(models.bridging_surat_kontrol_bpjs, {
                as: 'bridging_surat_kontrol_bpjs',
                foreignKey: 'no_sep',
            });
            bridging_sep.hasOne(models.maping_dokter_dpjpvclaim, {
                as: 'maping_dokter_dpjpvclaim',
                sourceKey: 'kddpjp',
                foreignKey: 'kd_dokter_bpjs',
            });
            bridging_sep.hasOne(models.pasien, {
                as: 'pasien',
                sourceKey: 'nomr',
                foreignKey: 'no_rkm_medis',
            });
            bridging_sep.hasOne(models.reg_periksa, {
                as: 'reg_periksa',
                foreignKey: 'no_rawat',
                sourceKey: 'no_rawat',
            });
            // bridging_sep.hasOne(models.maping_poli_bpjs, {
            //     as: 'maping_poli_bpjs',
            //     sourceKey: 'kdpolitujuan',
            //     foreignKey: 'kd_poli_bpjs',
            // });

        }
    }
    bridging_sep.init({
        no_sep: {
        type: DataTypes.STRING(40),
        primaryKey: true
        },
        no_rawat: DataTypes.STRING(17),
        tglsep: DataTypes.DATEONLY,
        tglrujukan: DataTypes.DATEONLY,
        jkel: DataTypes.ENUM('L','P'),
        no_rujukan: DataTypes.STRING(40),
        kdppkrujukan: DataTypes.STRING(12),
        nmppkrujukan: DataTypes.STRING(200),
        kdppkpelayanan: DataTypes.STRING(12),
        nmppkpelayanan: DataTypes.STRING(200),
        jnspelayanan: DataTypes.ENUM('1','2'),
        catatan: DataTypes.STRING(100),
        diagawal: DataTypes.STRING(10),
        nmdiagnosaawal: DataTypes.STRING(400),
        kdpolitujuan: DataTypes.STRING(15),
        nmpolitujuan: DataTypes.STRING(50),
        klsrawat: DataTypes.ENUM('1','2','3'),
        klsnaik: DataTypes.ENUM('','1','2','3','4','5','6','7','8'),
        pembiayaan: DataTypes.ENUM('','1','2','3'),
        pjnaikkelas: DataTypes.STRING(100),
        lakalantas: DataTypes.ENUM('0','1','2','3'),
        user: DataTypes.STRING(25),
        nomr: DataTypes.STRING(15),
        nama_pasien: DataTypes.STRING(100),
        tanggal_lahir: DataTypes.DATEONLY,
        peserta: DataTypes.STRING(100),
        no_kartu: DataTypes.STRING(25),
        tglpulang: DataTypes.DATE,
        asal_rujukan: DataTypes.ENUM('1. Faskes 1','2. Faskes 2(RS)'),
        eksekutif: DataTypes.ENUM('0. Tidak','1.Ya'),
        cob: DataTypes.ENUM('0. Tidak','1.Ya'),
        notelep: DataTypes.STRING(40),
        katarak: DataTypes.ENUM('0. Tidak','1.Ya'),
        tglkkl: DataTypes.DATEONLY,
        keterangankkl: DataTypes.STRING(100),
        suplesi: DataTypes.ENUM('0. Tidak','1.Ya'),
        no_sep_suplesi: DataTypes.STRING(40),
        kdprop: DataTypes.STRING(10),
        nmprop: DataTypes.STRING(50),
        kdkab: DataTypes.STRING(10),
        nmkab: DataTypes.STRING(50),
        kdkec: DataTypes.STRING(10),
        nmkec: DataTypes.STRING(50),
        noskdp: DataTypes.STRING(40),
        kddpjp: DataTypes.STRING(10),
        nmdpdjp: DataTypes.STRING(100),
        tujuankunjungan: DataTypes.ENUM('0','1','2'),
        flagprosedur: DataTypes.ENUM('','0','1'),
        penunjang: DataTypes.ENUM('','1','2','3','4','5','6','7','8','9','10','11','12'),
        asesmenpelayanan: DataTypes.ENUM('','1','2','3','4','5'),
        kddpjplayanan: DataTypes.STRING(10),
        nmdpjplayanan: DataTypes.STRING(100)
    }, {
        sequelize,
        modelName: 'bridging_sep',
        tableName: 'bridging_sep',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });

    return bridging_sep;
};

  
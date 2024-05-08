// CREATE TABLE `pemeriksaan_ranap` (
//     `no_rawat` varchar(17) NOT NULL,
//     `tgl_perawatan` date NOT NULL,
//     `jam_rawat` time NOT NULL,
//     `suhu_tubuh` varchar(5) DEFAULT NULL,
//     `tensi` varchar(8) NOT NULL,
//     `nadi` varchar(3) DEFAULT NULL,
//     `respirasi` varchar(3) DEFAULT NULL,
//     `tinggi` varchar(5) DEFAULT NULL,
//     `berat` varchar(5) DEFAULT NULL,
//     `spo2` varchar(3) NOT NULL,
//     `gcs` varchar(10) DEFAULT NULL,
//     `kesadaran` enum('Compos Mentis','Somnolence','Sopor','Coma','Alert','Confusion','Voice','Pain','Unresponsive') NOT NULL,
//     `keluhan` varchar(2000) DEFAULT NULL,
//     `pemeriksaan` varchar(2000) DEFAULT NULL,
//     `alergi` varchar(50) DEFAULT NULL,
//     `penilaian` varchar(2000) NOT NULL,
//     `rtl` varchar(2000) NOT NULL,
//     `instruksi` varchar(2000) NOT NULL,
//     `evaluasi` varchar(2000) NOT NULL,
//     `nip` varchar(20) NOT NULL,
//     PRIMARY KEY (`no_rawat`,`tgl_perawatan`,`jam_rawat`),
//     KEY `no_rawat` (`no_rawat`),
//     KEY `nip` (`nip`),
//     CONSTRAINT `pemeriksaan_ranap_ibfk_1` FOREIGN KEY (`no_rawat`) REFERENCES `reg_periksa` (`no_rawat`) ON DELETE CASCADE ON UPDATE CASCADE,
//     CONSTRAINT `pemeriksaan_ranap_ibfk_2` FOREIGN KEY (`nip`) REFERENCES `pegawai` (`nik`) ON DELETE CASCADE ON UPDATE CASCADE
//   ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
//   /*!40101 SET character_set_client = @saved_cs_client */;
'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class pemeriksaan_ranap extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            pemeriksaan_ranap.hasOne(models.reg_periksa, {
                as: 'reg_periksa',
                foreignKey: 'no_rawat',
            });
            pemeriksaan_ranap.hasOne(models.pegawai, {
                as: 'pegawai',
                foreignKey: 'nik',
                sourceKey: 'nip',
            });
        }
    }
    pemeriksaan_ranap.init({
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
        penilaian: DataTypes.TEXT,
        rtl: DataTypes.TEXT,
        instruksi: DataTypes.TEXT,
        evaluasi: DataTypes.TEXT,
        nip: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'pemeriksaan_ranap',
        tableName: 'pemeriksaan_ranap',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return pemeriksaan_ranap;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
    const bridging_surat_kontrol_bpjs = sequelize.define('bridging_surat_kontrol_bpjs', {
        no_sep: {
        type: DataTypes.STRING(40),
        primaryKey: true
        },
        tgl_surat: DataTypes.DATEONLY,
        no_surat: DataTypes.STRING(40),
        tgl_rencana: DataTypes.DATEONLY,
        kd_dokter_bpjs: DataTypes.STRING(20),
        nm_dokter_bpjs: DataTypes.STRING(50),
        kd_poli_bpjs: DataTypes.STRING(15),
        nm_poli_bpjs: DataTypes.STRING(40)
    }, {
        freezeTableName: true,
        timestamps: false,
        tableName: 'bridging_surat_kontrol_bpjs'
    });
    bridging_surat_kontrol_bpjs.associate = function(models) {
        // associations can be defined here
        bridging_surat_kontrol_bpjs.belongsTo(models.bridging_sep, {foreignKey: 'no_sep'})
    };
    return bridging_surat_kontrol_bpjs;
};
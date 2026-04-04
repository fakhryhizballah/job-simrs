'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class resep_luar extends Model {
        static associate(models) {
            resep_luar.belongsTo(models.reg_periksa, { foreignKey: 'no_rawat', targetKey: 'no_rawat' });
            resep_luar.belongsTo(models.dokter, { foreignKey: 'kd_dokter', targetKey: 'kd_dokter' });
            // resep_luar.hasMany(models.resep_luar_obat, { foreignKey: 'no_resep', sourceKey: 'no_resep' });
            // resep_luar.hasMany(models.resep_luar_racikan, { foreignKey: 'no_resep', sourceKey: 'no_resep' });
        }
    }
    resep_luar.init({
        no_resep: {
            type: DataTypes.STRING(14),
            primaryKey: true,
            allowNull: false,
            defaultValue: ''
        },
        tgl_perawatan: DataTypes.DATEONLY,
        jam: {
            type: DataTypes.TIME,
            allowNull: false
        },
        no_rawat: {
            type: DataTypes.STRING(17),
            allowNull: false,
            defaultValue: ''
        },
        kd_dokter: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        tgl_peresepan: DataTypes.DATEONLY,
        jam_peresepan: DataTypes.TIME
    }, {
        sequelize,
        modelName: 'resep_luar',
        tableName: 'resep_luar',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return resep_luar;
};

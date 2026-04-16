'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class resep_obat extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            resep_obat.belongsTo(models.reg_periksa, { foreignKey: 'no_rawat', targetKey: 'no_rawat' });
            resep_obat.belongsTo(models.dokter, { foreignKey: 'kd_dokter', targetKey: 'kd_dokter' });
            resep_obat.hasMany(models.resep_dokter, { foreignKey: 'no_resep', sourceKey: 'no_resep' });
            resep_obat.hasMany(models.resep_dokter_racikan, { foreignKey: 'no_resep', sourceKey: 'no_resep' });
            resep_obat.hasMany(models.detail_pemberian_obat, { foreignKey: 'no_rawat', sourceKey: 'no_rawat' });
        }
    }
    resep_obat.init({
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
        jam_peresepan: DataTypes.TIME,
        status: DataTypes.ENUM('ralan', 'ranap'),
        tgl_penyerahan: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        jam_penyerahan: {
            type: DataTypes.TIME,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'resep_obat',
        tableName: 'resep_obat',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return resep_obat;
};

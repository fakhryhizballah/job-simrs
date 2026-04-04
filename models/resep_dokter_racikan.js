'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class resep_dokter_racikan extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            resep_dokter_racikan.belongsTo(models.resep_obat, { foreignKey: 'no_resep', targetKey: 'no_resep' });
            resep_dokter_racikan.belongsTo(models.metode_racik, { foreignKey: 'kd_racik', targetKey: 'kd_racik' });
            resep_dokter_racikan.hasMany(models.resep_dokter_racikan_detail, { foreignKey: 'no_resep', sourceKey: 'no_resep' });
            resep_dokter_racikan.hasMany(models.resep_dokter_racikan_detail, { foreignKey: 'no_racik', sourceKey: 'no_racik' });
        }
    }
    resep_dokter_racikan.init({
        no_resep: {
            type: DataTypes.STRING(14),
            primaryKey: true,
            allowNull: false
        },
        no_racik: {
            type: DataTypes.STRING(2),
            primaryKey: true,
            allowNull: false
        },
        nama_racik: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        kd_racik: {
            type: DataTypes.STRING(3),
            allowNull: false
        },
        jml_dr: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        aturan_pakai: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        keterangan: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'resep_dokter_racikan',
        tableName: 'resep_dokter_racikan',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return resep_dokter_racikan;
};

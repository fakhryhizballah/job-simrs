'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class resep_dokter_racikan_detail extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            resep_dokter_racikan_detail.belongsTo(models.resep_obat, { foreignKey: 'no_resep', targetKey: 'no_resep' });
            resep_dokter_racikan_detail.belongsTo(models.resep_dokter_racikan, {
                foreignKey: 'no_resep',
                targetKey: 'no_resep'
            });
            resep_dokter_racikan_detail.belongsTo(models.resep_dokter_racikan, {
                foreignKey: 'no_racik',
                targetKey: 'no_racik'
            });
            resep_dokter_racikan_detail.belongsTo(models.databarang, { foreignKey: 'kode_brng', targetKey: 'kode_brng' });
        }
    }
    resep_dokter_racikan_detail.init({
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
        kode_brng: {
            type: DataTypes.STRING(15),
            primaryKey: true,
            allowNull: false
        },
        p1: DataTypes.DOUBLE,
        p2: DataTypes.DOUBLE,
        kandungan: DataTypes.STRING(10),
        jml: DataTypes.DOUBLE
    }, {
        sequelize,
        modelName: 'resep_dokter_racikan_detail',
        tableName: 'resep_dokter_racikan_detail',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return resep_dokter_racikan_detail;
};

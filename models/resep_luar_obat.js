'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class resep_luar_obat extends Model {
        static associate(models) {
            resep_luar_obat.belongsTo(models.resep_luar, { foreignKey: 'no_resep', targetKey: 'no_resep' });
            resep_luar_obat.belongsTo(models.databarang, { foreignKey: 'kode_brng', targetKey: 'kode_brng' });
        }
    }
    resep_luar_obat.init({
        no_resep: {
            type: DataTypes.STRING(14),
            primaryKey: true,
            allowNull: false
        },
        kode_brng: {
            type: DataTypes.STRING(15),
            primaryKey: true,
            allowNull: false
        },
        jml: DataTypes.DOUBLE,
        aturan_pakai: DataTypes.STRING(150),
    }, {
        sequelize,
        modelName: 'resep_luar_obat',
        tableName: 'resep_luar_obat',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return resep_luar_obat;
};

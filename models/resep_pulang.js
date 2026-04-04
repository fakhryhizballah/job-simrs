'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class resep_pulang extends Model {
        static associate(models) {
            resep_pulang.belongsTo(models.reg_periksa, { foreignKey: 'no_rawat', targetKey: 'no_rawat' });
            resep_pulang.belongsTo(models.databarang, { foreignKey: 'kode_brng', targetKey: 'kode_brng' });
            resep_pulang.belongsTo(models.bangsal, { foreignKey: 'kd_bangsal', targetKey: 'kd_bangsal' });
        }
    }
    resep_pulang.init({
        no_rawat: {
            type: DataTypes.STRING(17),
            primaryKey: true,
            allowNull: false
        },
        kode_brng: {
            type: DataTypes.STRING(15),
            primaryKey: true,
            allowNull: false
        },
        jml_barang: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        harga: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        total: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        dosis: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        tanggal: {
            type: DataTypes.DATEONLY,
            primaryKey: true,
            allowNull: false
        },
        jam: {
            type: DataTypes.TIME,
            primaryKey: true,
            allowNull: false
        },
        kd_bangsal: {
            type: DataTypes.STRING(5),
            allowNull: false
        },
        no_batch: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false
        },
        no_faktur: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'resep_pulang',
        tableName: 'resep_pulang',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return resep_pulang;
};

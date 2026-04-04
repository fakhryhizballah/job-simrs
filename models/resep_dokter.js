'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class resep_dokter extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            resep_dokter.belongsTo(models.resep_obat, { foreignKey: 'no_resep', targetKey: 'no_resep' });
            resep_dokter.belongsTo(models.databarang, { foreignKey: 'kode_brng', targetKey: 'kode_brng' });
        }

    }
    resep_dokter.init({
        no_resep: {
            type: DataTypes.STRING(14),
            primaryKey: true,
        },
        kode_brng: {
            type: DataTypes.STRING(15),
            primaryKey: true,
        },
        jml: DataTypes.DOUBLE,
        aturan_pakai: DataTypes.STRING(150),
    }, {
        sequelize,
        modelName: 'resep_dokter',
        tableName: 'resep_dokter',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return resep_dokter;
};
'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class satu_sehat_mapping_obat extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

    }
    satu_sehat_mapping_obat.init({
        kode_brng: {
            type: DataTypes.STRING(15),
            primaryKey: true,
            allowNull: false,
        },
        obat_code: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        obat_system: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        obat_display: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },
        form_code: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        form_system: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        form_display: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },
        numerator_code: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        numerator_system: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },
        denominator_code: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        denominator_system: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },
        route_code: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        route_system: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        route_display: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'satu_sehat_mapping_obat',
        tableName: 'satu_sehat_mapping_obat',
        timestamps: false,
        createdAt: false,
        updatedAt: false,

    });
    return satu_sehat_mapping_obat;
};
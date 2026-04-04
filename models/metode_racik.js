'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class metode_racik extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            metode_racik.hasMany(models.resep_dokter_racikan, { foreignKey: 'kd_racik', sourceKey: 'kd_racik' });
        }
    }
    metode_racik.init({
        kd_racik: {
            type: DataTypes.STRING(3),
            primaryKey: true,
            allowNull: false
        },
        nm_racik: {
            type: DataTypes.STRING(30),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'metode_racik',
        tableName: 'metode_racik',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return metode_racik;
};

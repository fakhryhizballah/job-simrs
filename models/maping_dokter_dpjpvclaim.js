'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class maping_dokter_dpjpvclaim extends Model {

        static associate(models) {
            // define association here
            maping_dokter_dpjpvclaim.hasOne(models.dokter, {
                foreignKey: 'kd_dokter',
                sourceKey: 'kd_dokter',
                as: 'dokter'
            });
        }

    }
    maping_dokter_dpjpvclaim.init({
        kd_dokter: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        kd_dokter_bpjs: DataTypes.STRING,
        nm_dokter_bpjs: DataTypes.STRING,

    }, {
        sequelize,
        modelName: 'maping_dokter_dpjpvclaim',
        tableName: 'maping_dokter_dpjpvclaim',
        timestamps: false,
        createdAt: false,
        updatedAt: false,



    });
    return maping_dokter_dpjpvclaim;
};
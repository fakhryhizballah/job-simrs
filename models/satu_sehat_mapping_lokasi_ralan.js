'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class satu_sehat_mapping_lokasi_ralan extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

    }
    satu_sehat_mapping_lokasi_ralan.init({
        kd_poli: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        id_organisasi_satusehat: DataTypes.STRING,
        id_lokasi_satusehat: DataTypes.STRING,
        longitude: DataTypes.STRING,
        latitude: DataTypes.STRING,
        altittude: DataTypes.STRING,

        // createdAt: { type: DataTypes.DATE, field: 'created_at' },
        // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
        // If don't want createdAt
    }, {
        sequelize,
        modelName: 'satu_sehat_mapping_lokasi_ralan',
        tableName: 'satu_sehat_mapping_lokasi_ralan',
        timestamps: false,
        createdAt: false,
        updatedAt: false,



    });
    return satu_sehat_mapping_lokasi_ralan;
};
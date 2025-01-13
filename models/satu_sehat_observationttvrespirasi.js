'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class satu_sehat_observationttvtensi extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

    }
    satu_sehat_observationttvtensi.init({
        no_rawat: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        tgl_perawatan: DataTypes.DATEONLY,
        jam_rawat: DataTypes.TIME,
        status: DataTypes.ENUM('Ralan', 'Ranap'),
        id_observation: DataTypes.STRING,

        // createdAt: { type: DataTypes.DATE, field: 'created_at' },
        // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
        // If don't want createdAt
    }, {
        sequelize,
        modelName: 'satu_sehat_observationttvtensi',
        tableName: 'satu_sehat_observationttvtensi',
        timestamps: false,
        createdAt: false,
        updatedAt: false,



    });
    return satu_sehat_observationttvtensi;
};
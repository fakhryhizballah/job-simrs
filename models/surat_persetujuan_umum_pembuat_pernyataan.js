'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class surat_persetujuan_umum_pembuat_pernyataan extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

    }
    surat_persetujuan_umum_pembuat_pernyataan.init({
        no_surat: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        photo: DataTypes.STRING,

        // createdAt: { type: DataTypes.DATE, field: 'created_at' },
        // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
        // If don't want createdAt
    }, {
        sequelize,
        modelName: 'surat_persetujuan_umum_pembuat_pernyataan',
        tableName: 'surat_persetujuan_umum_pembuat_pernyataan',
        timestamps: false,
        createdAt: false,
        updatedAt: false,



    });
    return surat_persetujuan_umum_pembuat_pernyataan;
};
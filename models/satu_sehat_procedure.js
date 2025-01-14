'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class satu_sehat_procedure extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

    }
    satu_sehat_procedure.init({
        no_rawat: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        kode: DataTypes.STRING,
        status: DataTypes.ENUM('Ralan', 'Ranap'),
        id_procedure: DataTypes.STRING,

        // createdAt: { type: DataTypes.DATE, field: 'created_at' },
        // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
        // If don't want createdAt
    }, {
        sequelize,
        modelName: 'satu_sehat_procedure',
        tableName: 'satu_sehat_procedure',
        timestamps: false,
        createdAt: false,
        updatedAt: false,



    });
    return satu_sehat_procedure;
};
'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class satu_sehat_condition extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

    }
    satu_sehat_condition.init({
        no_rawat: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        kd_penyakit: DataTypes.STRING,
        status: DataTypes.ENUM('Ralan', 'Ranap'),
        id_condition: DataTypes.STRING,

        // createdAt: { type: DataTypes.DATE, field: 'created_at' },
        // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
        // If don't want createdAt
    }, {
        sequelize,
        modelName: 'satu_sehat_condition',
        tableName: 'satu_sehat_condition',
        timestamps: false,
        createdAt: false,
        updatedAt: false,



    });
    return satu_sehat_condition;
};
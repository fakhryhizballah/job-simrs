'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class satu_sehat_encounter extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

    }
    satu_sehat_encounter.init({
        no_rawat: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        id_encounter: DataTypes.STRING,

        // createdAt: { type: DataTypes.DATE, field: 'created_at' },
        // updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
        // If don't want createdAt
    }, {
        sequelize,
        modelName: 'satu_sehat_encounter',
        tableName: 'satu_sehat_encounter',
        timestamps: false,
        createdAt: false,
        updatedAt: false,



    });
    return satu_sehat_encounter;
};
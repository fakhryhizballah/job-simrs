'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class referensi_mobilejkn_bpjs_taskid extends Model {
        /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
    }
    referensi_mobilejkn_bpjs_taskid.init({
        no_rawat: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        taskid: DataTypes.ENUM('1', '2', '3', '4', '5', '6', '7', '99'),
        waktu: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'referensi_mobilejkn_bpjs_taskid',
        tableName: 'referensi_mobilejkn_bpjs_taskid',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return referensi_mobilejkn_bpjs_taskid;
}
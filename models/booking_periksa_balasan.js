'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class booking_periksa_balasan extends Model {
        /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
        static associate(models) {
            booking_periksa_balasan.belongsTo(models.booking_periksa, {
                as: 'booking_periksa',
                foreignKey: 'no_booking',
            });
        }
    }
    booking_periksa_balasan.init({
        no_booking: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        balasan: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'booking_periksa_balasan',
        tableName: 'booking_periksa_balasan',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return booking_periksa_balasan;
}
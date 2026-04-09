'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class detail_pemberian_obat extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            detail_pemberian_obat.belongsTo(models.reg_periksa, {
                as: 'reg_periksa',
                foreignKey: 'no_rawat',
                sourceKey: 'no_rawat',
            });
            detail_pemberian_obat.belongsTo(models.databarang, {
                as: 'databarang',
                foreignKey: 'kode_brng',
                sourceKey: 'kode_brng',
            });
            detail_pemberian_obat.belongsTo(models.bangsal, {
                as: 'bangsal',
                foreignKey: 'kd_bangsal',
                sourceKey: 'kd_bangsal',
            });

        }
    }
    detail_pemberian_obat.init({
        tgl_perawatan: {
            type: DataTypes.DATEONLY,
            primaryKey: true,
            allowNull: false,
            defaultValue: '0000-00-00'
        },
        jam: {
            type: DataTypes.TIME,
            primaryKey: true,
            allowNull: false,
            defaultValue: '00:00:00'
        },
        no_rawat: {
            type: DataTypes.STRING(17),
            primaryKey: true,
            allowNull: false,
            defaultValue: '',
            references: {
                model: 'reg_periksa',
                key: 'no_rawat'
            }
        },
        kode_brng: {
            type: DataTypes.STRING(15),
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'databarang',
                key: 'kode_brng'
            }
        },
        h_beli: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        biaya_obat: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        jml: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        embalase: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        tuslah: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        total: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('Ralan', 'Ranap'),
            allowNull: true
        },
        kd_bangsal: {
            type: DataTypes.CHAR(5),
            allowNull: true,
            references: {
                model: 'bangsal',
                key: 'kd_bangsal'
            }
        },
        no_batch: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false
        },
        no_faktur: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'detail_pemberian_obat',
        tableName: 'detail_pemberian_obat',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return detail_pemberian_obat;
};

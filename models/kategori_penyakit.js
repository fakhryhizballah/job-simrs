const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class kategori_penyakit extends Model {
        /**
        * Helper method for defining associations.
        * This method is not a part of Sequelize lifecycle.
        * The `models/index` file will call this method automatically.
        */
        static associate(models) {
            kategori_penyakit.hasMany(models.penyakit, {
                as: 'penyakit',
                foreignKey: 'kd_ktg',
            });
        }
    }
    kategori_penyakit.init({
        kd_ktg: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        nm_kategori: DataTypes.STRING,
        ciri_umum: DataTypes.TEXT,
    }, {
        sequelize,
        modelName: 'kategori_penyakit',
        tableName: 'kategori_penyakit',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    return kategori_penyakit;
}
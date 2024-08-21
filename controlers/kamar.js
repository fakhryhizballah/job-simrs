require("dotenv").config();
const cron = require('node-cron');
const { Op } = require("sequelize");
const { kamar } = require("../models");
const { updateKamar } = require("../hooks/bpjs");
const dataKamar = require("../helpers/dataKamar.json");
async function uploadUpdate() {
    for (let e of dataKamar) {
        // console.log(e);
        let kapasitas = await kamar.count({
            where: {
                kd_bangsal: e.koderuang,
                statusdata: '1',
                kelas: {
                    [Op.or]: e.kelas
                }
            },
        });
        let tersedia = await kamar.count({
            where: {
                kd_bangsal: e.koderuang,
                statusdata: '1',
                status: 'KOSONG',
                kelas: {
                    [Op.or]: e.kelas
                }
            }
        });
        // console.log(kapasitas);
        // console.log(tersedia);
        let data = {
            "kodekelas": e.kodekelas,
            "koderuang": e.koderuang,
            "namaruang": e.namaruang,
            "kapasitas": kapasitas,
            "tersedia": tersedia,
            "tersediapria": tersedia,
            "tersediawanita": tersedia,
            "tersediapriawanita": tersedia
        }
        console.log(data);
        updateKamar(data).then(res => {
            console.log(res);
        })
    }

}
cron.schedule('*/30 * * * *', () => {
    uploadUpdate();
});
uploadUpdate();

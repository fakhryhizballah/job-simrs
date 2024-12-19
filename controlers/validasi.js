const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { bridging_sep, bridging_surat_kontrol_bpjs, pasien, reg_periksa, pemeriksaan_ralan, maping_poli_bpjs, maping_dokter_dpjpvclaim, jadwal } = require("../models");
const { Op } = require("sequelize");
require("dotenv").config();
async function sepRanap(date) {
    // let date = new Date();
    // let year = date.getFullYear();
    // let month = date.getMonth();
    // let day = date.getDate();
    // let tglSEP = `${year}-${month}-${day}`;
    let config = {
        method: 'get',
        url: `${process.env.URL_BPJS}/api/bpjs/monitoring/kunjungan?from=2024-06-01&until=2024-09-30&pelayanan=1`,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await axios(config);
        // console.log(response.data);

        fs.writeFileSync(path.join(__dirname, '../cache/sepRanap.json'), JSON.stringify(response.data.response.data, null, 4));
        return response.data;
    }
    catch (error) {
        console.log(error);
    }

}
// sepRanap();
async function sepBelumPulang(date) {
    fs.readFileSync(path.join(__dirname, '../cache/sepRanap.json'));
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '../cache/sepRanap.json')));
    let filteredBelumPulang = data.filter(item => item.tglPlgSep === null);
    fs.writeFileSync(path.join(__dirname, '../cache/sepBelumPulang.json'), JSON.stringify(filteredBelumPulang, null, 4));


}
// sepBelumPulang();
async function sepPulang(date) {
    const filterByTglPlgSep = (data, year, month) => {
        return data.filter(item => {
            const tglPlg = new Date(item.tglPlgSep);
            return tglPlg.getFullYear() === year && (tglPlg.getMonth() + 1) === month;
        });
    };
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '../cache/sepRanap.json')));

    // Memfilter data untuk Juni 2024
    const filteredData = filterByTglPlgSep(data, 2024, 9);
    let dataInacbg = JSON.parse(fs.readFileSync(path.join(__dirname, '../cache/ranap0924v1.json')));
    let filterSelisih = filteredData.filter(item => !dataInacbg.some(referred => referred.SEP === item.noSep))
    console.log(filterSelisih)
    console.log(filteredData.length);
    console.log(dataInacbg.length);
    // fs.writeFileSync(path.join(__dirname, '../cache/sepPulang08.json'), JSON.stringify(filteredData, null, 4));
}
sepPulang();
const fs = require('fs');
require('dotenv').config()
const { refKamar, getKamar, updateKamar } = require("../hooks/siranap");
const { kamar } = require("../models");


async function Kamar() {
    let mapping = fs.readFileSync('./cache/' + process.env.mapping + '.json');
    mapping = JSON.parse(mapping);
    console.log(mapping);

    for (let e of mapping) {
        let terpakai = await kamar.count({
            where: {
                kd_bangsal: e.kd_bangsal,
                statusdata: '1',
                status: 'ISI',
                kelas: e.kelas
            }
        });
        console.log(terpakai)
        let data = {
            "id_t_tt": e.id_t_tt,
            "terpakai": terpakai,
            "jumlah_ruang": e.jumlah_ruang,
            "jumlah": e.jumlah,
        }
        await updateKamar(data);
    }
}
Kamar();


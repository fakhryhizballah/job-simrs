const { bridging_sep, pasien, reg_periksa, pemeriksaan_ralan } = require("../models");
async function sttPeriksa(date) {
    let sttSudah = await reg_periksa.findAll({
        where: {
            tgl_registrasi: date,
            status_lanjut: 'Ralan',
            stts: 'Sudah',

        },
        attributes: ['no_rawat'],
    });
    /// array reg_periksa
    let arrayRegPeriksa = sttSudah.map((item) => item.no_rawat);
    // console.log(arrayRegPeriksa);
    let reg_pemeriksaan = await pemeriksaan_ralan.findAll({
        where: {
            no_rawat: arrayRegPeriksa,
            tgl_perawatan: date,
        },
        group: ['no_rawat'],
        attributes: ['no_rawat'],
    });
    let arrayRegPemeriksaan = reg_pemeriksaan.map((item) => item.no_rawat);
    let arrayBelum = arrayRegPeriksa.filter((item) => !arrayRegPemeriksaan.includes(item));
    // console.log(arrayBelum);
    // console.log(arrayRegPeriksa.length);
    // console.log(arrayRegPemeriksaan.length);
    console.log("belum " + arrayBelum.length);
    // update status
    if (arrayBelum.length > 0) {
        reg_periksa.update({
            stts: 'Belum',
        }, {
            where: {
                no_rawat: arrayBelum,
            },
        });
    }

}

// sttPeriksa('2024-05-17');
module.exports = {
    sttPeriksa,
};

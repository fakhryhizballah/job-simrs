require("dotenv").config();
const cron = require('node-cron');
const { Op } = require("sequelize");
const { bridging_sep, pasien, reg_periksa, pemeriksaan_ralan } = require("../models");
const { addAntrean, jddokter, getPesertabyKatu, post } = require("../hooks/bpjs");
const { convmils, milsPlus } = require("../helpers");
const { createClient } = require("redis");
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_URL_PORT,
    },
});
client.connect();


async function addAntreanCtrl() {
    let date = new Date().toISOString().slice(0, 10);
    let jsondata = await client.json.get(`antrols:${date}:addAntrians`, { path: '$..kodebooking' });
    if (!jsondata) {
        jsondata = [];
        await client.json.set(`antrols:${date}:addAntrians`, '$', jsondata);
    }
    let dSEP = await bridging_sep.findAll({
        where: {
            tglsep: date,
            jnspelayanan: 2,
            no_rawat: {
                [Op.notIn]: jsondata,
            },
            kdpolitujuan: { [Op.notIn]: ['IRM', 'GND', 'IGD', 'HDL'] },
            tujuankunjungan: { [Op.in]: ['0', '2'] },
        },
        include: [
            {
                model: pasien,
                as: 'pasien',
                attributes: ['no_ktp'],
            },
            {
                model: reg_periksa,
                as: 'reg_periksa',
                attributes: ['no_reg', 'status_poli', 'jam_reg', 'tgl_registrasi'],
            },
        ],
        attributes: ['no_sep', 'no_rawat', 'tglsep', 'tglrujukan', 'no_rujukan', 'noskdp', 'kdpolitujuan', 'nmpolitujuan', 'kddpjp', 'nmdpdjp', 'user', 'nomr', 'nama_pasien', 'notelep', 'tanggal_lahir', 'peserta', 'no_kartu', 'FlagProsedur'],
    });
    if (dSEP.length === 0) {
        return;
    }

    let kdPolis = dSEP.map((item) => item.kdpolitujuan);
    let kdPoli = [...new Set(kdPolis)];
    // await client.json.set(`antrols:${date}:jadwalDr`, '$', []);
    let dataJadwalDr = [];
    for (let i = 0; i < kdPoli.length; i++) {
        let jadwaldr = await jddokter(date, kdPoli[i]);
        if (jadwaldr.metadata.code == 200) {
            // await client.json.arrAppend(`antrols:${date}:jadwalDr`, '$', jadwaldr.response);
            dataJadwalDr.push(jadwaldr.response);
        }
    }
    // let dataJadwalDr = await client.json.get(`antrols:${date}:jadwalDr`);
    let berhasil = [];
    let gagal = [];
    for (let i = 0; i < dSEP.length; i++) {
        try {
            const dateString = `${dSEP[i].reg_periksa.tgl_registrasi} ${dSEP[i].reg_periksa.jam_reg}`;
            let date = new Date(dateString);
            date.setMinutes(date.getMinutes() + 20);
            const estimasidilayani = date.getTime();
            let pasienbaru = 0;
            if (dSEP[i].reg_periksa.stts_daftar == "Baru") {
                pasienbaru = 1;
            }
            let djdr = dataJadwalDr.flat().find(element => element.kodedokter == dSEP[i].kddpjp);
            let notelep = dSEP[i].notelep;
            if (notelep.length > 13) {
                notelep = notelep.substring(0, 13);
            }
            let noRef = dSEP[i].no_rujukan;
            if (noRef.length != 19) {
                noRef = dSEP[i].noskdp;
                console.log(dSEP[i].noskdp);
            }

            let data = {
                kodebooking: dSEP[i].no_rawat,
                jenispasien: "JKN",
                nomorkartu: dSEP[i].no_kartu,
                nik: dSEP[i].pasien.no_ktp,
                nohp: notelep,
                kodepoli: dSEP[i].kdpolitujuan,
                namapoli: dSEP[i].nmpolitujuan,
                pasienbaru: pasienbaru,
                norm: dSEP[i].nomr,
                tanggalperiksa: dSEP[i].tglsep,
                kodedokter: dSEP[i].kddpjp,
                namadokter: dSEP[i].nmdpdjp,
                jampraktek: `${djdr.jadwal}`,
                jeniskunjungan: 3,
                nomorreferensi: noRef,
                nomorantrean: `${dSEP[i].kdpolitujuan}-${dSEP[i].reg_periksa.no_reg}`,
                angkaantrean: parseInt(dSEP[i].reg_periksa.no_reg),
                estimasidilayani: estimasidilayani,
                sisakuotajkn: (djdr.kapasitaspasien - parseInt(dSEP[i].reg_periksa.no_reg)),
                kuotajkn: djdr.kapasitaspasien,
                sisakuotanonjkn: (djdr.kapasitaspasien - parseInt(dSEP[i].reg_periksa.no_reg)),
                kuotanonjkn: djdr.kapasitaspasien,
                keterangan: "Peserta harap 20 menit lebih awal guna pencatatan administrasi.",
            };

            let tambah = await addAntrean(data);
            console.log(tambah);
            let random1 = Math.floor(Math.random() * 6) + 5;
            let waktu1 = convmils(`${dSEP[i].reg_periksa.tgl_registrasi} ${dSEP[i].reg_periksa.jam_reg}`, -random1)
            console.log(`${dSEP[i].reg_periksa.tgl_registrasi} ${dSEP[i].reg_periksa.jam_reg}`, -random1);
            console.log(waktu1);
            let data1 = {
                kodebooking: dSEP[i].no_rawat,
                taskid: 1,
                waktu: waktu1,
            };
            await taksID(data1, dSEP[i].tgl_registrasi, "taksID1");
            let random2 = Math.floor(Math.random() * 4) + 1;
            let data2 = {
                kodebooking: dSEP[i].no_rawat,
                taskid: 2,
                waktu: convmils(`${dSEP[i].reg_periksa.tgl_registrasi} ${dSEP[i].reg_periksa.jam_reg}`, -random2),
            };
            await taksID(data2, dSEP[i].tgl_registrasi, "taksID2");

            if (tambah.metadata.code == 200 || tambah.metadata.code == 208) {
                berhasil.push({
                    ...data,
                    keterangan: tambah
                });


            } else {
                console.log(data);
                if (tambah.metadata.message == 'data nik  belum sesuai.') {
                    findNik = await getPesertabyKatu(data.nomorkartu)
                    data.nik = findNik.response.peserta.nik;
                    tambah = await addAntrean(data);
                }
                let dataGagal = {
                    ...data,
                    keterangan: tambah,
                };
                gagal.push(dataGagal);
            }
        } catch (error) {
            console.log(error);

        }
    }
    if (berhasil.length === 0) {
        return;
    } else {
        client.json.arrAppend(`antrols:${date}:addAntrians`, '$', berhasil);
    }
    await client.json.set(`antrols:${date}:addAntriansGagal`, '$', gagal);
}

async function taksID3(date) {
    let chacetaksID3 = await client.json.get(`antrols:${date}:taksID3:OK`, '$');
    if (!chacetaksID3) {
        chacetaksID3 = [];
        client.json.set(`antrols:${date}:taksID3:OK`, '$', chacetaksID3);
    }
    let idBooking = await client.json.get(`antrols:${date}:taksID2:OK`, { path: '$..kodebooking' });
    let datataksID3 = await client.json.get(`antrols:${date}:taksID3:OK`, { path: '$..kodebooking' });
    // filter idBooking
    let idBookingFilter = idBooking.filter((item) => !datataksID3.includes(item));
    console.log(idBookingFilter);
    let dataReg = await reg_periksa.findAll({
        where: {
            no_rawat: {
                [Op.in]: idBookingFilter,
            },
        },
        attributes: ['no_rawat', 'jam_reg', 'tgl_registrasi', 'stts'],
    });
    for (let i = 0; i < dataReg.length; i++) {
        // let random 5-10
        if (dataReg[i].stts == "Batal") {
            let data = {
                kodebooking: dataReg[i].no_rawat,
                keterangan: "Batal Daftar",
            };
            await taksIDbatal(data, dataReg[i].tgl_registrasi, "taksID3");
        }
        let waktu = convmils(dataReg[i].tgl_registrasi + " " + dataReg[i].jam_reg, 0);
        let data = {
            kodebooking: dataReg[i].no_rawat,
            taskid: 3,
            waktu: waktu,
        };
        await taksID(data, dataReg[i].tgl_registrasi, "taksID3");
        // break;
    }
}
async function taksID4(date) {
    let chacetaksID4 = await client.json.get(`antrols:${date}:taksID4:OK`, '$');
    if (!chacetaksID4) {
        chacetaksID4 = [];
        client.json.set(`antrols:${date}:taksID4:OK`, '$', chacetaksID4);
    }
    let idBooking = await client.json.get(`antrols:${date}:addAntrians`, { path: '$..kodebooking' });
    let datataksID4 = await client.json.get(`antrols:${date}:taksID4:OK`, { path: '$..kodebooking' });
    // filter idBooking
    let idBookingFilter = idBooking.filter((item) => !datataksID4.includes(item));
    console.log(idBookingFilter);
    let dataPeriksa = await pemeriksaan_ralan.findAll({
        where: {
            no_rawat: {
                [Op.in]: idBookingFilter,
            },
        },
        attributes: ['no_rawat', 'tgl_perawatan', 'jam_rawat'],
    });
    dataPeriksa = dataPeriksa.map((item) => {
        return {
            no_rawat: item.no_rawat,
            tgl_perawatan: item.tgl_perawatan,
            jam_rawat: item.jam_rawat,
        };
    }
    );
    let noRawat = dataPeriksa.map((item) => item.no_rawat);
    let noRawatFilter = [...new Set(noRawat)];
    console.log(noRawatFilter.length);
    for (let i = 0; i < noRawatFilter.length; i++) {
        let waktu = convmils(dataPeriksa[i].tgl_perawatan + " " + dataPeriksa[i].jam_rawat, 0);
        let data = {
            kodebooking: noRawatFilter[i],
            taskid: 4,
            waktu: waktu,
        };
        console.log(data);
        await taksID(data, dataPeriksa[i].tgl_perawatan, "taksID4");
    }
}
async function taksID5(date) {
    try {
        let chacetaksID5 = await client.json.get(`antrols:${date}:taksID5:OK`, '$');
        if (!chacetaksID5) {
            chacetaksID5 = [];
            client.json.set(`antrols:${date}:taksID5:OK`, '$', chacetaksID5);
        }
        let idBooking = await client.json.get(`antrols:${date}:addAntrians`, { path: '$..kodebooking' });
        let datataksID5 = await client.json.get(`antrols:${date}:taksID5:OK`, { path: '$..kodebooking' });
        // filter idBooking
        let idBookingFilter = idBooking.filter((item) => !datataksID5.includes(item));
        let dataReg = await reg_periksa.findAll({
            where: {
                no_rawat: {
                    [Op.in]: idBookingFilter,
                },
            },
            attributes: ['no_rawat', 'jam_reg', 'tgl_registrasi', 'stts'],
        });
        let chacetaksID4 = await client.json.get(`antrols:${date}:taksID4:OK`, '$');
        for (const data of dataReg) {
            let random = Math.floor(Math.random() * 4) + 1;
            if (data.stts == "Sudah") {
                try {
                    let waktuID4 = chacetaksID4.find((item) => item.data.kodebooking == data.no_rawat).data.waktu;
                    waktuID4 = milsPlus(waktuID4, random);
                    // let waktu = milsPlus( , random);
                    let data = {
                        kodebooking: data.no_rawat,
                        taskid: 5,
                        waktu: waktuID4,
                    };
                    await taksID(data, data.tgl_registrasi, "taksID5");
                } catch (error) {
                    console.log(error);
                }
                // break;

            }
            if (data.stts == "Batal") {
                let data = {
                    kodebooking: data.no_rawat,
                    keterangan: "Batal Daftar",
                };
                await taksID(data, data.tgl_registrasi, "taksID5");
            }
        }
    } catch (error) {
        console.log(error);
    }
}


async function taksIDbatal(data, date, taskid) {
    let postdata = await post(data, '/api/bpjs/antrean/batal');
    console.log(postdata);
    if (postdata.metadata.code == 200 || postdata.metadata.code == 208) {

        await client.json.arrAppend(`antrols:${date}:${taskid}:OK`, '$', { data, postdata });
    }
    else {
        await client.json.set(`antrols:${date}:${taskid}:Gagal`, '$', { data, postdata });
    }

}

async function taksID(data, date, taskid) {
    console.log(data);
    let postdata = await post(data, '/api/bpjs/antrean/updatewaktu/');
    console.log(postdata);
    if (postdata.metadata.code == 200 || postdata.metadata.code == 208) {

        client.json.arrAppend(`antrols:${date}:${taskid}:OK`, '$', { data, postdata });
    }
    else {
        client.json.set(`antrols:${date}:${taskid}:Gagal`, '$', { data, postdata });
    }
}

// addAntreanCtrl("2024-05-07");
// taksID1("2024-05-07");
// taksID2("2024-05-07");
// taksID3("2024-05-06");
// taksID4("2024-05-06");
// taksID5("2024-05-06");

// let run
// cron.schedule('0 7 * * 1-6', () => {
//     run = setInterval(addAntreanCtrl, 15000);
// });
// cron.schedule('0 13 * * 1-6', () => {
//     clearInterval(run);
// });
cron.schedule('* 7-13 * * 1-6', () => {
    addAntreanCtrl();
});

// cron.schedule('0 7 * * 1-6', () => {

// setInterval(addAntreanCtrl, 15000);

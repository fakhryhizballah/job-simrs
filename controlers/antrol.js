require("dotenv").config();
const cron = require('node-cron');
const { Op } = require("sequelize");
const { bridging_sep, pasien, reg_periksa, pemeriksaan_ralan, maping_poli_bpjs, maping_dokter_dpjpvclaim, jadwal } = require("../models");
const { addAntrean, updatewaktu, batalAntrean, getAntrian, getlisttask, jddokter, getPesertabyKatu, post } = require("../hooks/bpjs");
const { convmils, milsPlus, getRandomTimeInMillis, getRandomInt, setStingTodate, days } = require("../helpers");
const { sttPeriksa } = require("../helpers/kalibarsi");
const { createClient } = require("redis");
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_URL_PORT,
    },
});
client.connect();

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected')); 



async function addAntreanJKN(date) {
    console.log(days(date));
    let res = await getAntrian(date);
    let kodebooking = [];
    if (res.metadata.code == 200) {
        console.log(res);
        let filter = res.response.filter((item) => item.ispeserta === true);
        kodebooking = filter.map((item) => item.kodebooking);
    }
    console.log(kodebooking);
    let regBooking = await reg_periksa.findAll({
        where: {
            no_rawat: { [Op.notIn]: kodebooking },
            tgl_registrasi: date,
            kd_pj: 'BPJ',
            status_lanjut: 'Ralan',
            kd_poli: { [Op.notIn]: ['IGDK', 'U0003', 'U0008', 'U0022', 'U0055', 'U0054'] },
        },
        include: [{
            model: maping_poli_bpjs,
            as: 'maping_poli_bpjs',
            attributes: ['kd_poli_bpjs', 'nm_poli_bpjs']
        }, {
            model: maping_dokter_dpjpvclaim,
            as: 'maping_dokter_dpjpvclaim',
            attributes: ['kd_dokter_bpjs', 'nm_dokter_bpjs']
        }, {
            model: pasien,
            as: 'pasien',
            attributes: ['no_ktp', 'no_tlp', 'no_peserta']
        }, {
            model: bridging_sep,
            as: 'bridging_sep',
            attributes: ['no_rujukan', 'noskdp', 'no_sep']
        }
        ],
        attributes: ['no_reg', 'no_rawat', 'tgl_registrasi', 'no_rkm_medis', 'jam_reg', 'kd_pj', 'kd_dokter', 'kd_poli'],
        order: [
            ['jam_reg', 'DESC'],
        ],
    });
    let sepNull = 0;
    for (let element of regBooking) {
        // console.log(element.bridging_sep)
        if (element.bridging_sep == null) {
            sepNull++;
            continue;
        }
        let noRef = element.bridging_sep.no_rujukan;
        // console.log(noRef);
        if (noRef.length != 19) {
            noRef = element.bridging_sep.noskdp;
            if (noRef.length != 19) {
                noRef = element.bridging_sep.no_sep;
            }
        }
        console.log(noRef);
        let jadwalDr = await client.json.get(`Antrol:${date}:${element.maping_poli_bpjs.kd_poli_bpjs}`)
        if (jadwalDr == null) {
            jadwalDr = await jddokter(date, element.maping_poli_bpjs.kd_poli_bpjs);
            jadwalDr = jadwalDr.response
            client.json.set(`Antrol:${date}:${element.maping_poli_bpjs.kd_poli_bpjs}`, '$', jadwalDr)
            client.expire(`Antrol:${date}:${element.maping_poli_bpjs.kd_poli_bpjs}`, 3600)
        }
        let jadwals = jadwalDr.find((item) => item.kodedokter == element.maping_dokter_dpjpvclaim.kd_dokter_bpjs);
        let estimasidilayani = convmils(`${element.tgl_registrasi} ${element.jam_reg}`, 30);
        let data = {
            kodebooking: element.no_rawat,
            jenispasien: "JKN",
            nomorkartu: element.pasien.no_peserta,
            nik: element.pasien.no_ktp,
            nohp: element.pasien.no_tlp,
            kodepoli: element.maping_poli_bpjs.kd_poli_bpjs,
            namapoli: element.maping_poli_bpjs.nm_poli_bpjs,
            pasienbaru: element.stts_daftar == "Baru" ? 1 : 0,
            norm: element.no_rkm_medis,
            tanggalperiksa: element.tgl_registrasi,
            kodedokter: element.maping_dokter_dpjpvclaim.kd_dokter_bpjs,
            namadokter: element.maping_dokter_dpjpvclaim.nm_dokter_bpjs,
            jampraktek: jadwals.jadwal,
            jeniskunjungan: 3,
            nomorreferensi: noRef,
            nomorantrean: `${element.maping_poli_bpjs.kd_poli_bpjs}-${element.no_reg}`,
            angkaantrean: parseInt(element.no_reg),
            estimasidilayani: estimasidilayani,
            sisakuotajkn: (jadwals.kapasitaspasien - parseInt(element.no_reg)),
            kuotajkn: jadwals.kapasitaspasien,
            sisakuotanonjkn: (jadwals.kapasitaspasien - parseInt(element.no_reg)),
            kuotanonjkn: jadwals.kapasitaspasien,
            keterangan: "Peserta harap 20 menit lebih awal guna pencatatan administrasi.",
        };
        console.log(data);
        let random1 = getRandomInt(10, 15);
        let waktuTask1 = convmils(`${element.tgl_registrasi} ${element.jam_reg}`, -random1);
        let taks1 = {
            kodebooking: element.no_rawat,
            taskid: 1,
            waktu: waktuTask1,
        };

        let random2 = getRandomInt(1, 10);
        let waktuTask2 = convmils(`${element.tgl_registrasi} ${element.jam_reg}`, -random2);
        let taks2 = {
            kodebooking: element.no_rawat,
            taskid: 2,
            waktu: waktuTask2,
        };

        let waktuTask3 = convmils(`${element.tgl_registrasi} ${element.jam_reg}`, 0);
        let taks3 = {
            kodebooking: element.no_rawat,
            taskid: 3,
            waktu: waktuTask3,
        };

        let tambah = await addAntrean(data);
        console.log(tambah);
        if (tambah.metadata.code == 200) {
            let taksID1 = await updatewaktu(taks1);
            console.log(taks1);
            console.log(taksID1);
            let taksID2 = await updatewaktu(taks2);
            console.log(taks2);
            console.log(taksID2);
            let taksID3 = await updatewaktu(taks3);
            console.log(taks3);
            console.log(taksID3);
        }
    }
    console.log(regBooking.length);
    console.log(sepNull);


}

async function addAntreanNon(date) {
    console.log(date);
    console.log(days(date));
    let res = await getAntrian(date);
    if (res.metadata.code != 200) {
        console.log(res);
        return;
    }
    let filter = res.response.filter((item) => item.ispeserta === false);

    let kodebooking = filter.map((item) => item.kodebooking);

    let regBooking = await reg_periksa.findAll({
        where: {
            no_rawat: { [Op.notIn]: kodebooking },
            tgl_registrasi: date,
            kd_pj: { [Op.notLike]: 'BPJ' },
            status_lanjut: 'Ralan',
            kd_poli: { [Op.notIn]: ['IGDK', 'U0003', 'U0008', 'U0022', 'U0055', 'U0054'] },
        },
        include: [{
            model: maping_poli_bpjs,
            as: 'maping_poli_bpjs',
            attributes: ['kd_poli_bpjs', 'nm_poli_bpjs']
        }, {
            model: maping_dokter_dpjpvclaim,
            as: 'maping_dokter_dpjpvclaim',
            attributes: ['kd_dokter_bpjs', 'nm_dokter_bpjs']
        }, {
            model: pasien,
            as: 'pasien',
            attributes: ['no_ktp', 'no_tlp']
        }
        ],
        attributes: ['no_reg', 'no_rawat', 'tgl_registrasi', 'no_rkm_medis', 'jam_reg', 'kd_pj', 'kd_dokter', 'kd_poli'],
        order: [
            ['jam_reg', 'DESC'],
        ],
    });
    for (let element of regBooking) {
        console.log(element)
        let jadwalDr = await client.json.get(`Antrol:${date}:${element.maping_poli_bpjs.kd_poli_bpjs}`)
        if (jadwalDr == null) {
            jadwalDr = await jddokter(date, element.maping_poli_bpjs.kd_poli_bpjs);
            jadwalDr = jadwalDr.response
            client.json.set(`Antrol:${date}:${element.maping_poli_bpjs.kd_poli_bpjs}`, '$', jadwalDr)
            client.expire(`Antrol:${date}:${element.maping_poli_bpjs.kd_poli_bpjs}`, 3600)
        }
        let jadwals = jadwalDr.find((item) => item.kodedokter == element.maping_dokter_dpjpvclaim.kd_dokter_bpjs);
        let estimasidilayani = convmils(`${element.tgl_registrasi} ${element.jam_reg}`, 30);
        let data = {
            kodebooking: element.no_rawat,
            jenispasien: "NON JKN",
            nomorkartu: '',
            nik: element.pasien.no_ktp,
            nohp: element.pasien.no_tlp,
            kodepoli: element.maping_poli_bpjs.kd_poli_bpjs,
            namapoli: element.maping_poli_bpjs.nm_poli_bpjs,
            pasienbaru: element.stts_daftar == "Baru" ? 1 : 0,
            norm: element.no_rkm_medis,
            tanggalperiksa: element.tgl_registrasi,
            kodedokter: element.maping_dokter_dpjpvclaim.kd_dokter_bpjs,
            namadokter: element.maping_dokter_dpjpvclaim.nm_dokter_bpjs,
            jampraktek: jadwals.jadwal,
            jeniskunjungan: 3,
            nomorreferensi: '',
            nomorantrean: `${element.maping_poli_bpjs.kd_poli_bpjs}-${element.no_reg}`,
            angkaantrean: parseInt(element.no_reg),
            estimasidilayani: estimasidilayani,
            sisakuotajkn: (jadwals.kapasitaspasien - parseInt(element.no_reg)),
            kuotajkn: jadwals.kapasitaspasien,
            sisakuotanonjkn: (jadwals.kapasitaspasien - parseInt(element.no_reg)),
            kuotanonjkn: jadwals.kapasitaspasien,
            keterangan: "Peserta harap 20 menit lebih awal guna pencatatan administrasi.",
        };
        console.log(data);
        let random1 = getRandomInt(10, 15);
        console.log(`${element.tgl_registrasi} ${element.jam_reg}`);
        console.log(random1);
        let waktuTask1 = convmils(`${element.tgl_registrasi} ${element.jam_reg}`, -random1);
        let taks1 = {
            kodebooking: element.no_rawat,
            taskid: 1,
            waktu: waktuTask1,
        };
        console.log(taks1);
        let random2 = getRandomInt(1, 10);
        console.log(random2);
        let waktuTask2 = convmils(`${element.tgl_registrasi} ${element.jam_reg}`, -random2);
        let taks2 = {
            kodebooking: element.no_rawat,
            taskid: 2,
            waktu: waktuTask2,
        };
        console.log(taks2);
        let waktuTask3 = convmils(`${element.tgl_registrasi} ${element.jam_reg}`, 0);
        let taks3 = {
            kodebooking: element.no_rawat,
            taskid: 3,
            waktu: waktuTask3,
        };
        console.log(taks3);
        let tambah = await addAntrean(data);
        console.log(tambah);
        if (tambah.metadata.code == 200) {
            let taksID1 = await updatewaktu(taks1);
            console.log(taksID1);
            let taksID2 = await updatewaktu(taks2);
            console.log(taksID2);
            let taksID3 = await updatewaktu(taks3);
            console.log(taksID3);
        }
    }
}

async function taksID12(kdkodebooking) {
    let regBooking = await reg_periksa.findAll({
        where: {
            no_rawat: kdkodebooking,
        },
    });
    let taks1 = {
        kodebooking: kdkodebooking,
        taskid: 1,
        waktu: convmils(`${regBooking[0].tgl_registrasi} ${regBooking[0].jam_reg}`, -10),
    };
    let taks2 = {
        kodebooking: kdkodebooking,
        taskid: 2,
        waktu: convmils(`${regBooking[0].tgl_registrasi} ${regBooking[0].jam_reg}`, -5),
    };
    let taks3 = {
        kodebooking: kdkodebooking,
        taskid: 3,
        waktu: convmils(`${regBooking[0].tgl_registrasi} ${regBooking[0].jam_reg}`, 0),
    };
    let taksID1 = await updatewaktu(taks1);
    console.log(taksID1);
    let taksID2 = await updatewaktu(taks2);
    console.log(taksID2);
    let taksID3 = await updatewaktu(taks3);
    console.log(taksID3);
}


async function lajutAja4(date) {
    let res = await getAntrian(date);
    try {
        let sisa = res.response.filter((item) => item.status == 'Belum dilayani');
        let kodebookings = sisa.map((item) => item.kodebooking);
        let dataPeriksa = await pemeriksaan_ralan.findAll({
            where: {
                no_rawat: kodebookings,
                tgl_perawatan: date,
            },
            attributes: ['no_rawat', 'tgl_perawatan', 'jam_rawat'],
            order: [
                ['jam_rawat', 'DESC'],
            ],
        });
        for (const item of dataPeriksa) {
            let kodebooking = item.no_rawat;
            let waktu = convmils(item.tgl_perawatan + " " + item.jam_rawat, 0);
            let data = {
                kodebooking: kodebooking,
                taskid: 4,
                waktu: waktu,
            };
            console.log(data);
            // let x = await updatewaktu(data);
            // console.log(x.metadata);
            // if (x.metadata.code == 201) {
            //     taksID12(kodebooking)
            // }
            // if (x.metadata.message == 'TaskId=3 belum ada') {
            //     taksID12(kodebooking)
            // }
            updatewaktu(data).then((x) => {
                console.log(x);
                if (x.metadata.code == 201) {
                    taksID12(kodebooking)
                }
                if (x.metadata.message == 'TaskId=3 tidak ada') {
                    taksID12(kodebooking)
                }
            }).catch((err) => {
                console.log(err);
            });

        }
        console.log(dataPeriksa.length);
        console.log(sisa.length);
        return;
    } catch (error) {
        console.log(error);
    }
}



async function lajutAja5backdate(date) {
    let res = await getAntrian(date);
    await sttPeriksa(date);
    try {
        let sisa = res.response.filter((item) => item.status == "Sedang dilayani");
        let kodebookings = sisa.map((item) => item.kodebooking);
        let regSudah = await reg_periksa.findAll({
            where: {
                no_rawat: kodebookings,
                tgl_registrasi: date,
                status_lanjut: 'Ralan',
                stts: 'Sudah',
            },
            attributes: ['no_rawat'],
        });;
        let kodebookingfilter = regSudah.map((item) => item.no_rawat);
        for (const item of kodebookingfilter) {

            try {
                const gettaks = await getlisttask(item);
                let x = gettaks.response;
                let index = x.findIndex(obj => obj.taskid === 4);
                let y = x[index].wakturs;
                let mils = setStingTodate(y);
                mils += getRandomTimeInMillis(2, 10);

                let data = {
                    kodebooking: x[index].kodebooking,
                    taskid: 5,
                    waktu: mils,
                };
                // let z = await updatewaktu(data);
                // console.log(x[index]);
                // console.log(data);
                // console.log(z);

                updatewaktu(data).then((z) => {
                    console.log(x[index]);
                    console.log(data);
                    console.log(z);
                }).catch((err) => {
                    console.log(err);
                });
            }
            catch (error) {
                console.log(error);
            }


        }

    } catch (error) {
        console.log(error);
    }
}
async function lajutAja5(date) {
    let res = await getAntrian(date);
    await sttPeriksa(date);
    try {
        let sisa = res.response.filter((item) => item.status == "Sedang dilayani");
        let kodebookings = sisa.map((item) => item.kodebooking);
        let regSudah = await reg_periksa.findAll({
            where: {
                no_rawat: kodebookings,
                tgl_registrasi: date,
                status_lanjut: 'Ralan',
                stts: 'Sudah',
            },
            attributes: ['no_rawat'],
        });;
        let kodebookingfilter = regSudah.map((item) => item.no_rawat);
        for (const item of kodebookingfilter) {
            try {
                let currentDate = new Date();

                // Dapatkan timestamp dalam milidetik
                let timestampInMillis = currentDate.getTime();

                let data = {
                    kodebooking: item,
                    taskid: 5,
                    waktu: timestampInMillis,
                };
                let z = await updatewaktu(data);
            }
            catch (error) {
                console.log(error);
            }
        }

    } catch (error) {
        console.log(error);
    }
}
// addAntreanJKN('2024-05-02');
// lajutAja4("2024-05-02");
// lajutAja5backdate("2024-07-12");
// lajutAja5("2024-05-18");
// sttPeriksa('2024-05-18');
// batasAja("2024-05-04");

let TIMEANTREAN = process.env.TIMEANTREAN || '* 7-15 * * 1-6';
cron.schedule('* 7-15 * * 1-6', () => {
    let date = new Date().toISOString().slice(0, 10);
    // taksID3(date);
    console.log('Update antrian ' + date);
    lajutAja4(date);
    lajutAja5(date);
});

let TIMEANTREANNON = process.env.TIMEANTREANNON || '* 7-13 * * 1-6';
cron.schedule('* 7-13 * * 1-6', () => {
    let date = new Date().toISOString().slice(0, 10);
    addAntreanNon(date)
    addAntreanJKN(date);
    console.log('tambah antrian ' + date);
});

// async function backdate(date) {
//     // await addAntreanJKN(date);
//     console.log("JKN");
//     await lajutAja4(date);
//     console.log("lajutAja4");
//     await lajutAja5backdate(date);
//     console.log("lajutAja5backdate");
// }
// backdate("2024-07-05");


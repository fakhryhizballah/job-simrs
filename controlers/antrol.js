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
        console.log(jadwalDr)
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

// addAntreanNon('2024-05-20')

// cron.schedule('* 7-15 * * 1-6', () => {
//     addAntreanCtrl();
// });



async function batasAja(date) {
    let res = await getAntrian(date);
    let sisa = res.response.filter((item) => item.status == 'Belum dilayani');

    for (const item of sisa) {
        let data = {
            kodebooking: item.kodebooking,
            keterangan: "tidak dilayani Soap tidak di isi",
        };
        // console.log(data);
        taksIDbatal(data, date, 99)
    }
}
// batasAja("2024-05-02");

async function taksID3(date) {
    let res = await getAntrian(date);
    let getReg = res.response.filter((item) => item.status == 'Belum dilayani');
    let kodebookings = getReg.map((item) => item.kodebooking);
    let regPerikasa = await reg_periksa.findAll({
        where: {
            no_rawat: kodebookings,
            tgl_registrasi: date,
        },
        attributes: ['no_rawat', 'tgl_registrasi', 'jam_reg'],
        order: [
            ['jam_reg', 'DESC'],
        ],
    });
    for (const item of regPerikasa) {
        let kodebooking = item.no_rawat;
        let waktu = convmils(item.tgl_registrasi + " " + item.jam_reg, 0);
        let data = {
            kodebooking: kodebooking,
            taskid: 3,
            waktu: waktu,
        };
        console.log(data);
        let x = await updatewaktu(data);
        console.log(x.metadata);

    }
    console.log(regPerikasa.length);
}
// taksID3("2024-05-02");

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
            let x = await updatewaktu(data);
            console.log(x.metadata);

        }
        console.log(dataPeriksa.length);
        console.log(sisa.length);
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
                let z = await updatewaktu(data);
                console.log(x[index]);
                console.log(data);
                console.log(z);

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
        console.log(kodebookings);
        let kodebookingfilter = regSudah.map((item) => item.no_rawat);
        for (const item of kodebookingfilter) {

            console.log(item);
            try {
                let currentDate = new Date();

                // Dapatkan timestamp dalam milidetik
                let timestampInMillis = currentDate.getTime();
                console.log(timestampInMillis);

                let data = {
                    kodebooking: item,
                    taskid: 5,
                    waktu: timestampInMillis,
                };
                let z = await updatewaktu(data);

                console.log(data);
                console.log(z);

            }
            catch (error) {
                console.log(error);
            }


        }

    } catch (error) {
        console.log(error);
    }
}
// taksID3("2024-05-04");
// lajutAja4("2024-05-18");
// lajutAja5("2024-05-18");
// lajutAja5backdate("2024-05-04");
// sttPeriksa('2024-05-18');
cron.schedule('* 7-15 * * 1-6', () => {
    let date = new Date().toISOString().slice(0, 10);
    // taksID3(date);
    addAntreanNon(date)
    lajutAja4(date);
    lajutAja5(date);
});



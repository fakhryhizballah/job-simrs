require("dotenv").config();
const cron = require('node-cron');
const { Op } = require("sequelize");
const { bridging_sep, pasien, reg_periksa, pemeriksaan_ralan } = require("../models");
const { addAntrean, updatewaktu, batalAntrean, getAntrian, getlisttask, jddokter, getPesertabyKatu, post } = require("../hooks/bpjs");
const { convmils, milsPlus, getRandomTimeInMillis, setStingTodate } = require("../helpers");
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
    lajutAja4(date);
    lajutAja5(date);
});

// Dapatkan semua kunci Redis
// cleankey('antrols:*');

async function zz() {
    // let x = await client.keys('data:SEP:klaim:2:*');
    let x = await client.keys('data:monitoring:klaim:2023-06-01:2023-06-02:*');
    console.log(x);
    for (let i = 0; i < x.length; i++) {
        console.log(x[i]);
        client.del(x[i]);
    }
}

// zz();    
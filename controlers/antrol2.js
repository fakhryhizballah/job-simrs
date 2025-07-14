require("dotenv").config();
const cron = require('node-cron');
const { bridging_sep, bridging_surat_kontrol_bpjs, pasien, reg_periksa, pemeriksaan_ralan, maping_poli_bpjs, maping_dokter_dpjpvclaim, jadwal, resep_obat, resep_dokter_racikan } = require("../models");
const { addAntrean, updatewaktu, updatewaktuJKN, batalAntrean, getAntrian, getlisttask, jddokter, getPesertabyKatu, getRujukan, getJumlahsep, getlistrencanakontrol, getfinger, addAntreanFarmasi, post } = require("../hooks/bpjs");
const { convmils, milsPlus, getRandomTimeInMillis, getRandomInt, setStingTodate, days, stringToEpoch } = require("../helpers");
const { sttPeriksa } = require("../helpers/kalibarsi");
const { createClient } = require("redis");
const { Op } = require("sequelize");

const REDIS_DB = process.env.REDIS_DB || 0;
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_URL_PORT,
    },
    database: REDIS_DB, // letakkan di sini, bukan dalam socket
});
client.connect();

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected')); 


async function addAntreanJKNNext(date) {
    console.log(days(date));
    let res = await getAntrian(date);
    let kodebooking = [];
    if (res.metadata.code == 200) {

        let filter = res.response.filter((item) => item.ispeserta === true);
        // filter = filter.filter((item) => item.status === 'Belum dilayani');
        kodebooking = filter.map((item) => item.kodebooking);
    }

    let regBooking = await reg_periksa.findAll({
        where: {
            no_rawat: { [Op.notIn]: kodebooking },
            tgl_registrasi: date,
            kd_pj: 'BPJ',
            status_lanjut: 'Ralan',
            kd_poli: { [Op.notIn]: ['IGDK', 'U0003', 'U0008', 'U0022', 'U0055', 'U0054'] },
        },
        attributes: ['no_reg', 'no_rawat', 'tgl_registrasi', 'no_rkm_medis', 'jam_reg', 'kd_pj', 'kd_dokter', 'kd_poli', 'status_poli'],
        order: [
            ['jam_reg', 'DESC'],
        ],
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
        }
        ],
    });

    // return;
    for (let element of regBooking) {
        console.log(element.no_rawat);
        let bulan = element.tgl_registrasi.substring(5, 7)
        let tahun = element.tgl_registrasi.substring(0, 4)
        let jeniskunjungan = 3;
        let noRef = `I/${element.no_rawat}`
        let rujukan = await getRujukan(element.pasien.no_peserta);
        // console.log(rujukan.response);
        if (rujukan.response == null) {
            let rencanaKontrol = await getlistrencanakontrol(bulan, tahun, element.pasien.no_peserta);
            // console.log(rencanaKontrol.response);
            if (rencanaKontrol.response == null) {
                jeniskunjungan = 2;
            } else {
                let tglRencanaKontrol = rencanaKontrol.response.list.filter(item => item.tglRencanaKontrol == element.tgl_registrasi);
                // console.log(tglRencanaKontrol);
                if (tglRencanaKontrol.length == 0) {
                    jeniskunjungan = 2;
                } else {
                    noRef = tglRencanaKontrol[0].noSuratKontrol;
                    jeniskunjungan = 3;
                }
            }
        } else if (rujukan.response.rujukan.length > 1) {
            let rujukanByPoli = rujukan.response.rujukan.filter(item => item.poliRujukan.kode == element.maping_poli_bpjs.kd_poli_bpjs);
            // console.log(rujukanByPoli);
            if (rujukanByPoli.length > 0) {
                let jmlRujukan = await getJumlahsep(1, rujukanByPoli[0].noKunjungan);
            // console.log(jmlRujukan.response.jumlahSEP);
            if (jmlRujukan.response.jumlahSEP == 0) {
                jeniskunjungan = 1;
                noRef = rujukanByPoli[0].noKunjungan;
            } else {
                let rencanaKontrol = await getlistrencanakontrol(bulan, tahun, element.pasien.no_peserta);
                if (rencanaKontrol.response == null) {
                    jeniskunjungan = 2;
                } else {
                    // console.log(rencanaKontrol.response.list);
                    noRef = rencanaKontrol.response.list[0].noSuratKontrol;
                }
                }
            }
        } else {
            jeniskunjungan = 2;

        }
        // return;
        element.maping_poli_bpjs.kd_poli_bpjs == "096" ? element.maping_poli_bpjs.kd_poli_bpjs = "PAR" : element.maping_poli_bpjs.kd_poli_bpjs
        // element.maping_poli_bpjs.kd_poli_bpjs == "017" ? element.maping_poli_bpjs.kd_poli_bpjs = "BED" : element.maping_poli_bpjs.kd_poli_bpjs
        let jadwalDr = await client.json.get(`Antrol:${date}:${element.maping_poli_bpjs.kd_poli_bpjs}`)
        if (jadwalDr == null) {
            jadwalDr = await jddokter(date, element.maping_poli_bpjs.kd_poli_bpjs);
            jadwalDr = jadwalDr.response
            // console.log(jadwalDr);
            if (jadwalDr == undefined || jadwalDr.length == 0) {
                continue;
            }
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
            jampraktek: jadwals.jadwal || "-",
            jeniskunjungan: jeniskunjungan,
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
        let tambah = await addAntrean(data);
        console.log(tambah);
        if (tambah.metadata.message == 'Data dokter tidak ditemukan.') {
            continue;
        }
        if (tambah.metadata.message == 'Rujukan tidak valid') {
            data.jeniskunjungan = 2;
            tambah = await addAntrean(data);
            console.log(tambah);
        }
        if (tambah.metadata.code == 201) {
            data.jeniskunjungan = 2;
            tambah = await addAntrean(data);
            console.log(tambah);
        }
        // return ;
    }
    let mapsregBooking = regBooking.map((item) => item.no_rawat);
    console.log(mapsregBooking);
    console.log("Belum " + mapsregBooking.length);
    console.log("sudah " + kodebooking.length);
    return;
}

// addAntreanJKNNext("2025-07-12");


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
        if (jadwalDr == null || jadwalDr === undefined) {
            jadwalDr = await jddokter(date, element.maping_poli_bpjs.kd_poli_bpjs);
            console.log()
            if (jadwalDr.metadata.code == 201) {
                continue;
            }
            jadwalDr = jadwalDr.response
            client.json.set(`Antrol:${date}:${element.maping_poli_bpjs.kd_poli_bpjs}`, '$', jadwalDr)
            client.expire(`Antrol:${date}:${element.maping_poli_bpjs.kd_poli_bpjs}`, 3600)
        }
        console.log(jadwalDr);
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
        let tambah = await addAntrean(data);
        console.log(tambah);
        // return ;
    }
}
// addAntreanNon("2025-07-12");

async function cekIn(date) {
    let res = await getAntrian(date);
    if (res.metadata.code == 204) {
        return;
    }
    let sisa = res.response.filter((item) => item.status == 'Belum dilayani');
    // let sisa = res.response((item) => item.status == 'Belum dilayani');
    sisa = sisa.filter((item) => item.sumberdata != "Mobile JKN");
    console.log(sisa);
    let kodebookings = sisa.map((item) => item.kodebooking);
    console.log(kodebookings.length);
    // console.log(sisa[0].tanggal);
    let noBPJS = sisa.map((item) => item.nokapst);
    noBPJS = noBPJS.filter((item, index, self) => self.indexOf(item) === index);
    console.log(noBPJS.length);
    for (let item of noBPJS) {
        let norm = sisa.find(x => x.nokapst == item);
        console.log(norm);
        let kdBok = await reg_periksa.findOne({
            where: {
                tgl_registrasi: sisa[0].tanggal,
                no_rkm_medis: norm.norekammedis
            },
            attributes: ['no_rawat', 'tgl_registrasi', 'jam_reg'],
        });
        if (kdBok == null) {
            console.log(`Tidak ada data untuk ${item} pada tanggal ${sisa[0].tanggal}`);
            continue;
        }
        let periksan = await pemeriksaan_ralan.findAll({
            where: {
                no_rawat: kdBok.no_rawat,
            },
            attributes: ['no_rawat', 'tgl_perawatan', 'jam_rawat'],
            order: [['jam_rawat', 'ASC']],
        });
        if (periksan.length == 0) {
            console.log(`Tidak ada pemeriksaan untuk ${item} pada tanggal ${sisa[0].tanggal}`);
            continue;
        }

        let milsReg = convmils(`${kdBok.tgl_registrasi} ${kdBok.jam_reg}`, 0);
        let milsPeriksa = convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, 0);
        console.log(`${kdBok.tgl_registrasi} ${kdBok.jam_reg} ` + milsReg);
        console.log(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat} ` + milsPeriksa);
        if (milsReg > milsPeriksa) {
            if (periksan.length >= 2) {
                console.log(`Sudah diperiksa pada `);
                let taks1 = {
                    kodebooking: kdBok.no_rawat,
                    taskid: 1,
                    waktu: convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, -10) + getRandomInt(1000, 10000),
                };
                let taks2 = {
                    kodebooking: kdBok.no_rawat,
                    taskid: 2,
                    waktu: convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, -6) + getRandomInt(1000, 10000),
                };
                let taks3 = {
                    kodebooking: kdBok.no_rawat,
                    taskid: 3,
                    waktu: convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, 0),
                };
                let taks4 = {
                    kodebooking: kdBok.no_rawat,
                    taskid: 4,
                    waktu: convmils(`${periksan[1].tgl_perawatan} ${periksan[1].jam_rawat}`, 0),
                };
                let taks5 = {
                    kodebooking: kdBok.no_rawat,
                    taskid: 5,
                    waktu: convmils(`${periksan[1].tgl_perawatan} ${periksan[1].jam_rawat}`, 3),
                };
                for (let task of [taks1, taks2, taks3, taks4, taks5]) {
                    console.log(task);
                    let updated = await updatewaktu(task);
                    console.log(updated);
                    if (updated.metadata.code == 201) {
                        console.log(`fakeAntrol ${kdBok.no_rawat}`);
                        await fakeAntrol(kdBok.no_rawat);
                    }
                }
            }
        } else {
            if (periksan.length >= 2) {
                const selisihMs = milsPeriksa - milsReg;
                const selisihMenit = Math.round(selisihMs / (1000 * 60)); // dibulatkan

                console.log('Selisih dalam menit (bulat):', selisihMenit);
                if (selisihMenit > 60) {
                    console.log(`Terlambat lebih dari 60 menit untuk ${item}`);
                    let taks1 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 1,
                        waktu: convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, -40 + getRandomInt(1, 5)) + getRandomInt(1000, 90000),
                    };
                    let taks2 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 2,
                        waktu: convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, -30 + getRandomInt(1, 5)) + getRandomInt(1000, 90000),
                    };
                    let taks3 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 3,
                        waktu: convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, -20 + getRandomInt(1, 5)) + getRandomInt(1000, 90000),
                    };
                    let taks4 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 4,
                        waktu: convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, 0),
                    };
                    let taks5 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 5,
                        waktu: convmils(`${periksan[1].tgl_perawatan} ${periksan[1].jam_rawat}`, 0),
                    };
                    for (let task of [taks1, taks2, taks3, taks4, taks5]) {
                        console.log(task);
                        let updated = await updatewaktu(task);
                        console.log(updated);
                        if (updated.metadata.code == 201) {
                            console.log(`fakeAntrol ${kdBok.no_rawat}`);
                            await fakeAntrol(kdBok.no_rawat);
                        }
                    }
                } else {
                    console.log(`Terlambat kurang dari 60 menit untuk ${item}`);
                    let taks1 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 1,
                        waktu: convmils(`${kdBok.tgl_registrasi} ${kdBok.jam_reg}`, 0),
                    };
                    let taks2 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 2,
                        waktu: convmils(`${kdBok.tgl_registrasi} ${kdBok.jam_reg}`, (selisihMenit / 2)) + getRandomInt(1000, 90000),
                    };
                    let taks3 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 3,
                        waktu: convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, 0),
                    };
                    let taks4 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 4,
                        waktu: convmils(`${periksan[1].tgl_perawatan} ${periksan[1].jam_rawat}`, 0),
                    };
                    let taks5 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 5,
                        waktu: convmils(`${periksan[1].tgl_perawatan} ${periksan[1].jam_rawat}`, 2) + getRandomInt(1000, 90000),
                    };
                    for (let task of [taks1, taks2, taks3, taks4, taks5]) {
                        console.log(task);
                        let updated = await updatewaktu(task);
                        console.log(updated);
                        if (updated.metadata.code == 201) {
                            console.log(`fakeAntrol ${kdBok.no_rawat}`);
                            await fakeAntrol(kdBok.no_rawat);
                        }
                    }
                }
            } else {
                console.log(`Hanya ada satu pemeriksaan untuk ${item}`);
                if (norm.kodepoli == "IRM") {
                    let taks3 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 3,
                        waktu: convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, -20) + getRandomInt(1000, 90000),
                    };
                    let taks4 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 4,
                        waktu: convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, 0) + getRandomInt(1000, 90000),
                    };
                    let taks5 = {
                        kodebooking: kdBok.no_rawat,
                        taskid: 5,
                        waktu: convmils(`${periksan[0].tgl_perawatan} ${periksan[0].jam_rawat}`, 10) + getRandomInt(1000, 90000),
                    };
                    for (let task of [taks3, taks4, taks5]) {
                        console.log(task);
                        let updated = await updatewaktu(task);
                        console.log(updated);
                        if (updated.metadata.code == 201) {
                            console.log(`fakeAntrol ${kdBok.no_rawat}`);
                            await fakeAntrol(kdBok.no_rawat);
                        }
                    }
                } else {
                    await reg_periksa.update({
                        stts: 'Belum',
                    }, {
                        where: {
                            no_rawat: kdBok.no_rawat
                        }
                    });
                }
            }
        }
    }
    return;

}

async function fakeAntrol(kodebooking) {
    let findLastTaksId = await getlisttask(kodebooking);
    let last = findLastTaksId.response[findLastTaksId.response.length - 1];

    console.log(last);
    let before = stringToEpoch(last.wakturs);
    console.log(before);
    let data = {
        kodebooking: kodebooking,
        taskid: last.taskid + 1,
        waktu: before + getRandomTimeInMillis(2, 5),
    };
    let updateTaksid = await updatewaktu(data);
    console.log(updateTaksid);
    return;

}
cekIn("2025-07-12");
// let x = getRandomInt(1, 5);
// console.log(x);

async function mJKN(date) {
    let res = await getAntrian(date);
    if (res.metadata.code == 204) {
        return;
    }
    let sisa = res.response.filter((item) => item.ispeserta == true);
    sisa = sisa.filter((item) => item.status == 'Belum dilayani');
    sisa = sisa.filter((item) => item.sumberdata == "Mobile JKN");
    console.log(sisa);
    for (let item of sisa) {
        let isexist = res.response.filter(x => x.nokapst == item.nokapst);
        if (isexist.length > 1) {
            console.log(isexist[isexist.length - 1].kodebooking);
            let oldlisttask = await getlisttask(isexist[isexist.length - 1].kodebooking);
            console.log(oldlisttask);
            if (oldlisttask.metadata.code == 200) {
                for (let task of oldlisttask.response) {
                    let taks = {
                        kodebooking: item.kodebooking,
                        taskid: task.taskid,
                        waktu: stringToEpoch(task.wakturs),
                    };
                    let updated = await updatewaktu(taks);
                    console.log(updated);
                }
            }
        }
    }
}
// mJKN("2025-07-11");

// addAntreanJKNNext("2025-07-12");

addAntreanJKNNext("2025-07-15");
// let TIMEANTREANJKNNEXT = process.env.TIMEANTREANJKNNEXT || '*/10 10-16 * * 1-6';
// cron.schedule(TIMEANTREANJKNNEXT, () => {
//     let date = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
//     addAntreanJKNNext(date);
//     addAntreanNon(date)
//     console.log('tambah antrian ' + date);
// });

// let TIMEANTREANNON = process.env.TIMEANTREANNON || '*/2 7-15 * * 1-6';
// cron.schedule(TIMEANTREANNON, () => {
//     let date = new Date().toISOString().slice(0, 10);
//     addAntreanNon(date)
//     addAntreanJKNNext(date);
//     cekIn(date);
//     console.log('tambah antrian ' + date);
// });
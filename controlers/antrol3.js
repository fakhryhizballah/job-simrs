require("dotenv").config();
// const cron = require('node-cron');
const { Op, json, where } = require("sequelize"); 
const { bridging_sep, bridging_surat_kontrol_bpjs, referensi_mobilejkn_bpjs_taskid, referensi_mobilejkn_bpjs, pasien, reg_periksa, pemeriksaan_ralan, maping_poli_bpjs, maping_dokter_dpjpvclaim, jadwal, resep_obat, resep_dokter_racikan } = require("../models"); 
const { convmils, milsPlus, getRandomTimeInMillis, getRandomInt, setStingTodate, days, stringToEpoch } = require("../helpers");
const { sttPeriksa } = require("../helpers/kalibarsi");
const { createClient } = require("redis"); 
const Bpjs = require('../helpers/bpjs');
// const REDIS_DB = process.env.REDIS_DB || 0;
// const client = createClient({
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_URL,
//         port: process.env.REDIS_URL_PORT,
//     },
//     database: REDIS_DB, // letakkan di sini, bukan dalam socket
// });
// client.connect();

// client.on('error', (err) => console.log('Redis Client Error', err));
// client.on('connect', () => console.log('Redis Client Connected'));

const getHeaders = (data) => ({
    'X-cons-id': process.env['BPJS.X_cons_id'],
    'X-timestamp': data.timestamp,
    'X-signature': data.signature,
    'user_key': process.env['BPJS.user_key'],
    'Content-Type': 'application/json'
});
async function getAntrian(date) {
    const bpjs = new Bpjs();
    const data = bpjs.getSignature();
    const headers = getHeaders(data);
    const url = `${process.env['BPJS.URL']}/antreanrs/antrean/pendaftaran/tanggal/${date}`;
    console.log(url);
    const response = await fetch(url, {
        method: 'GET',
        headers: headers
    });
    const bpjsRes = await response.json();
    if (bpjsRes.metadata.code !== 200) return bpjsRes;
    const key = data.X_cons_id + data.secretKey + data.timestamp;
    let hasil = bpjs.stringDecrypt(key, bpjsRes.response);
    bpjsRes.response = JSON.parse(bpjs.decompress(hasil));
    console.log(bpjsRes.response.length);
    return bpjsRes;
}
// getAntrian('2026-08-12');
async function dashboard(date) {
    const bpjs = new Bpjs();
    const data = bpjs.getSignature();
    const headers = getHeaders(data);
    const url = `${process.env['BPJS.URL']}/antreanrs/dashboard/waktutunggu/tanggal/${date}/waktu/rs`;
    console.log(url);
    const response = await fetch(url, {
        method: 'GET',
        headers: headers
    });
    const bpjsRes = await response.json();
    console.log(bpjsRes);
    if (bpjsRes.metadata.code !== 200) return bpjsRes;
    console.log(JSON.stringify(bpjsRes.response, null, 2));
    // const key = data.X_cons_id + data.secretKey + data.timestamp;
    // let hasil = bpjs.stringDecrypt(key, bpjsRes.response);
    // bpjsRes.response = JSON.parse(bpjs.decompress(hasil));
    return bpjsRes;
}
// dashboard('2026-08-11');

async function getBelum() {
    const bpjs = new Bpjs();
    const data = bpjs.getSignature();
    const headers = getHeaders(data);
    const url = `${process.env['BPJS.URL']}/antreanrs/antrean/pendaftaran/aktif`;
    const response = await fetch(url, {
        method: 'GET',
        headers: headers
    });
    const bpjsRes = await response.json();
    if (bpjsRes.metadata.code !== 200) return bpjsRes;
    const key = data.X_cons_id + data.secretKey + data.timestamp;
    let hasil = bpjs.stringDecrypt(key, bpjsRes.response);
    bpjsRes.response = JSON.parse(bpjs.decompress(hasil));
    return bpjsRes;
}

async function getlisttask(kodebooking) {
    const bpjs = new Bpjs();
    const data = bpjs.getSignature();
    const headers = getHeaders(data);
    const url = `${process.env['BPJS.URL']}/antreanrs/antrean/getlisttask`;
    console.log(url);
    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            "kodebooking": kodebooking
        })
    });
    const bpjsRes = await response.json();
    if (bpjsRes.metadata.code !== 200) return bpjsRes;
    const key = data.X_cons_id + data.secretKey + data.timestamp;
    let hasil = bpjs.stringDecrypt(key, bpjsRes.response);
    bpjsRes.response = JSON.parse(bpjs.decompress(hasil));
    return bpjsRes;
    
}
// getlisttask('20260811000019');
async function kirimBatal(kodebooking, keterangan) {
    const bpjs = new Bpjs();
    const data = bpjs.getSignature();
    const headers = getHeaders(data);
    const url = `${process.env['BPJS.URL']}/antreanrs/antrean/batal`;
    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            "kodebooking": kodebooking,
            "keterangan": keterangan
        })
    });
    const bpjsRes = await response.json();
    if (bpjsRes.metadata.code !== 200) return bpjsRes;
    // const key = data.X_cons_id + data.secretKey + data.timestamp;
    // let hasil = bpjs.stringDecrypt(key, bpjsRes.response);
    // bpjsRes.response = JSON.parse(bpjs.decompress(hasil));
    return bpjsRes;
    
}
async function updatewaktu(pesan) {
    const bpjs = new Bpjs();
    const data = bpjs.getSignature();
    const headers = getHeaders(data);
    const url = `${process.env['BPJS.URL']}/antreanrs/antrean/updatewaktu`;
    console.log(url);
    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(pesan)
    });
    const bpjsRes = await response.json();
    if (bpjsRes.metadata.code !== 200) return bpjsRes;
    return bpjsRes;
}

async function selesaikan(date) {
    let data = await getBelum();
    for (let x of data.response) {
        if (x.sumberdata == 'Mobile JKN' && x.tanggal == date) {
         
            let cekStatusReg = await referensi_mobilejkn_bpjs.findOne({
                where: {
                    nobooking: x.kodebooking
                },
                attributes: ['no_rawat', 'status', 'validasi',"statuskirim"],
                include: [
                    {
                        model: reg_periksa,
                        as: 'reg_periksa',
                        attributes: ['jam_reg', 'stts_daftar', 'status_lanjut','stts']
                    }
                ]
            });
            console.log(JSON.stringify(cekStatusReg, null, 2));
            if (cekStatusReg.reg_periksa.status_lanjut != 'Ralan' || cekStatusReg.reg_periksa.stts == 'Batal') {
                console.log("Batal Antrean");
               let result = await kirimBatal(x.kodebooking, 'Batal Periksa');
               console.log(result);
                continue;
            }
            let statusTaksid = await getlisttask(x.kodebooking);
            if (statusTaksid.metadata.code == 200) {
                console.log(statusTaksid.response);
                let cekSoap = await pemeriksaan_ralan.findAll({
                    where: {
                        no_rawat: cekStatusReg.no_rawat
                    },
                    order: [
                        ['jam_rawat', 'ASC'],
                    ],
                    attributes: ['no_rawat', 'jam_rawat', 'nip']
                })
                console.log(JSON.stringify(cekSoap, null, 2));
                if (cekSoap.length >= 2) {
                    let lastTaksID = statusTaksid.response[statusTaksid.response.length - 1];
                    console.log(lastTaksID);
                    let wakturs = stringToEpoch(lastTaksID.wakturs);
                   console.log(wakturs);
                   let nextTime = wakturs + getRandomTimeInMillis(2, 5);
                   console.log(nextTime);
                    let data = {
                        kodebooking: x.kodebooking,
                        taskid: lastTaksID.taskid + 1,
                        waktu: nextTime,
                    };
                    let updateTaksid = await updatewaktu(data);
                    let nextTime2 = nextTime + getRandomTimeInMillis(2, 5);
                    let data2 = {
                        kodebooking: x.kodebooking,
                        taskid: lastTaksID.taskid + 2,
                        waktu: nextTime,
                    };
                    let updateTaksid2 = await updatewaktu(data2);
                    console.log(updateTaksid2);
            
                }

                
            }


        }
        if (x.sumberdata == 'Bridging Antrean' && x.tanggal == date) {
            console.log(JSON.stringify(x, null, 2));
            let cekSoap = await pemeriksaan_ralan.findAll({
                where: {
                    no_rawat: x.kodebooking
                },
                order: [
                    ['jam_rawat', 'ASC'],
                ],
                attributes: ['no_rawat', 'jam_rawat', 'nip']
            })
            console.log(JSON.stringify(cekSoap, null, 2));
            if (cekSoap.length >= 2) {
                console.log('cekSoap.length >= 2');
                let statusTaksid = await getlisttask(x.kodebooking);
                console.log(statusTaksid);
                if (statusTaksid.metadata.code == 204) {
                    const baseTimeSoap0 = new Date(`${date} ${cekSoap[0].jam_rawat}`).getTime();
                    const baseTimeSoap1 = new Date(`${date} ${cekSoap[1].jam_rawat}`).getTime();

                    const tasks = [
                        { taskid: 1, waktu: baseTimeSoap0 - getRandomTimeInMillis(4, 5) },
                        { taskid: 2, waktu: (baseTimeSoap0 - getRandomTimeInMillis(2, 3)) },
                        { taskid: 3, waktu: baseTimeSoap0 },
                        { taskid: 4, waktu: baseTimeSoap1 },
                        { taskid: 5, waktu: baseTimeSoap1 + getRandomTimeInMillis(1, 3) },
                    ];

                    for (const task of tasks) {
                        const updateResult = await updatewaktu({ kodebooking: x.kodebooking, ...task });
                        console.log(updateResult);
                    }
                }
               
                return;
            }
            console.log('cekSoap.length <= 2');
        }
    }


}
// selesaikan('2026-08-12');

async function selesaikanManual(date) {
    let data = await getAntrian(date);
    if (data.metadata.code !== 200) return data;
    for (const x of data.response) {
        if (x.sumberdata == 'Bridging Antrean' && x.status == 'Belum dilayani') {
            let cekStatusReg = await reg_periksa.findOne({
                where: {
                    no_rawat: x.kodebooking
                },
                attributes: ['jam_reg', 'stts_daftar', 'status_lanjut', 'stts']
                
            })
            // console.log(cekStatusReg);
            if (cekStatusReg == null) {
                console.log('batal ' + x.kodebooking);
                let result = await kirimBatal(x.kodebooking, 'Batal Periksa');
                console.log(result);
                continue;
            }
            if (cekStatusReg.status_lanjut != 'Ralan' || cekStatusReg.stts == 'batal') {
                console.log('batal ' + x.kodebooking);
                let result = await kirimBatal(x.kodebooking, 'Batal Periksa');
                console.log(result);
                continue;
                
            }
            let statusTaksid = await getlisttask(x.kodebooking);
            if (statusTaksid.metadata.code == 204) {
                let cekSoap = await pemeriksaan_ralan.findAll({
                    where: {
                        no_rawat: x.kodebooking
                    },
                    order: [
                        ['jam_rawat', 'ASC'],
                    ],
                    attributes: ['no_rawat', 'jam_rawat', 'nip']
                })
                console.log(JSON.stringify(cekSoap, null, 2));
                if (cekSoap.length >= 2) {
                    console.log(JSON.stringify(cekSoap, null, 2));
                    const baseTimeSoap0 = new Date(`${date} ${cekSoap[0].jam_rawat}`).getTime();
                    const baseTimeSoap1 = new Date(`${date} ${cekSoap[1].jam_rawat}`).getTime();

                    const tasks = [
                        { taskid: 1, waktu: baseTimeSoap0 - getRandomTimeInMillis(4, 5) },
                        { taskid: 2, waktu: (baseTimeSoap0 - getRandomTimeInMillis(2, 3)) },
                        { taskid: 3, waktu: baseTimeSoap0 },
                        { taskid: 4, waktu: baseTimeSoap1 },
                        { taskid: 5, waktu: baseTimeSoap1 + getRandomTimeInMillis(1, 3) },
                    ];

                    for (const task of tasks) {
                        const updateResult = await updatewaktu({ kodebooking: x.kodebooking, ...task });
                        console.log(updateResult);
                    }
                } 
                if (cekSoap.length > 0) {
                    // console.log('cekSoap.length > 0');
                    // const baseTimeSoap0 = new Date(`${date} ${cekSoap[0].jam_rawat}`).getTime();
                    // const tasks = [
                    //     { taskid: 1, waktu: baseTimeSoap0 - getRandomTimeInMillis(4, 5) },
                    //     { taskid: 2, waktu: (baseTimeSoap0 - getRandomTimeInMillis(2, 3)) },
                    //     { taskid: 3, waktu: baseTimeSoap0 },
                    //     { taskid: 4, waktu: baseTimeSoap0 + getRandomTimeInMillis(1, 3) },
                    //     { taskid: 5, waktu: baseTimeSoap0 + getRandomTimeInMillis(3, 6) },
                    // ];
                    // for (const task of tasks) {
                    //     console.log(task + ' ' + x.kodebooking);
                    //     const updateResult = await updatewaktu({ kodebooking: x.kodebooking, ...task });
                    //     console.log(updateResult);
                    // }
                }else {
                    console.log('cekSoap.length <= 2');
                }
                
            }
            if (statusTaksid.metadata.code == 200){
                let lastTaksID = statusTaksid.response[statusTaksid.response.length - 1];
                let wakturs = stringToEpoch(lastTaksID.wakturs);
                let nextTime = wakturs + getRandomTimeInMillis(2, 5);
                let data = {
                    kodebooking: x.kodebooking,
                    taskid: lastTaksID.taskid + 1,
                    waktu: nextTime,
                };
                let updateTaksid = await updatewaktu(data);
                console.log(updateTaksid);
            }
        }
        if (x.sumberdata == 'Mobile JKN' && x.status == 'Belum dilayani') {

            let cekStatusReg = await referensi_mobilejkn_bpjs.findOne({
                where: {
                    nobooking: x.kodebooking
                },
                attributes: ['no_rawat', 'status', 'validasi', "statuskirim"],
                include: [
                    {
                        model: reg_periksa,
                        as: 'reg_periksa',
                        attributes: ['jam_reg', 'stts_daftar', 'status_lanjut', 'stts']
                    }
                ]
            });
            console.log(JSON.stringify(cekStatusReg, null, 2));
            if (cekStatusReg.reg_periksa == null) {
                console.log("Batal Antrean");
                let result = await kirimBatal(x.kodebooking, 'Batal Periksa');
                console.log(result);
                continue;
            }
            if (cekStatusReg.reg_periksa.status_lanjut != 'Ralan' || cekStatusReg.reg_periksa.stts == 'Batal') {
                console.log("Batal Antrean");
                let result = await kirimBatal(x.kodebooking, 'Batal Periksa');
                console.log(result);
                continue;
            }
            let statusTaksid = await getlisttask(x.kodebooking);
            let cekSoap = await pemeriksaan_ralan.findAll({
                where: {
                    no_rawat: cekStatusReg.no_rawat
                },
                order: [
                    ['jam_rawat', 'ASC'],
                ],
                attributes: ['no_rawat', 'jam_rawat', 'nip']
            })
            console.log(JSON.stringify(cekSoap, null, 2));
            if (statusTaksid.metadata.code == 200) {
                console.log(statusTaksid.response);
                
                if (cekSoap.length >= 2) {
                    const baseTimeSoap0 = new Date(`${date} ${cekSoap[0].jam_rawat}`).getTime();
                    const baseTimeSoap1 = new Date(`${date} ${cekSoap[1].jam_rawat}`).getTime();

                    const tasks = [
                        { taskid: 1, waktu: baseTimeSoap0 - getRandomTimeInMillis(4, 5) },
                        { taskid: 2, waktu: (baseTimeSoap0 - getRandomTimeInMillis(2, 3)) },
                        { taskid: 3, waktu: baseTimeSoap0 },
                        { taskid: 4, waktu: baseTimeSoap1 },
                        { taskid: 5, waktu: baseTimeSoap1 + getRandomTimeInMillis(1, 3) },
                    ];

                    for (const task of tasks) {
                        const updateResult = await updatewaktu({ kodebooking: x.kodebooking, ...task });
                        console.log(updateResult);
                    }
                }


            }
            if (statusTaksid.metadata.code == 204) {
                if (cekSoap.length >= 2) {
                    const baseTimeSoap0 = new Date(`${date} ${cekSoap[0].jam_rawat}`).getTime();
                    const baseTimeSoap1 = new Date(`${date} ${cekSoap[1].jam_rawat}`).getTime();

                    const tasks = [
                        { taskid: 1, waktu: baseTimeSoap0 - getRandomTimeInMillis(4, 5) },
                        { taskid: 2, waktu: (baseTimeSoap0 - getRandomTimeInMillis(2, 3)) },
                        { taskid: 3, waktu: baseTimeSoap0 },
                        { taskid: 4, waktu: baseTimeSoap1 },
                        { taskid: 5, waktu: baseTimeSoap1 + getRandomTimeInMillis(1, 3) },
                    ];

                    for (const task of tasks) {
                        const updateResult = await updatewaktu({ kodebooking: x.kodebooking, ...task });
                        console.log(updateResult);
                    }
                }
            }


        }
    }
}
// selesaikanManual('2026-08-11');



// console.log('1786408986000' - getRandomTimeInMillis(2, 5));
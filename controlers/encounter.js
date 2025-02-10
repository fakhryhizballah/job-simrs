const { satu_sehat_encounter, satu_sehat_mapping_lokasi_ralan, satu_sehat_mapping_lokasi_ranap, bangsal, poliklinik, reg_periksa, kamar_inap, kamar, pasien, pegawai, referensi_mobilejkn_bpjs_taskid, diagnosa_pasien, penyakit } = require("../models");
const { postEncouter, postEncouter2, postData, getIHS, postCondition, getEncounter, getStatus, updateEncounter } = require("../hooks/satusehat");
const { getlisttask } = require("../hooks/bpjs");
const { convertToISO, setStingTodate, convertToISO3 } = require("../helpers/");
const { Op, json } = require("sequelize");
// const mongoose = require('mongoose');
// const Encounter = require("../modelsMongoose/Encounter");
require("dotenv").config();
// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log('MongoDB Connected')).catch((err) => console.log(err));
const { createClient } = require("redis");
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_URL_PORT,
    },
});
client.connect();

async function postEncouterRalan(date) {
    let no_rawat = date.split("-").join("/");
    let dataFiletr = await referensi_mobilejkn_bpjs_taskid.findAll({
        where: {
            taskid: '4',
            no_rawat: { [Op.startsWith]: no_rawat },
            '$encounter.id_encounter$': { [Op.is]: null },
            '$reg.status_lanjut$': 'Ralan',
            '$reg.kd_poli$': { [Op.notIn]: ['IGDK'] }
        },
        include: [{
            model: satu_sehat_encounter,
            as: 'encounter',
            // attributes: ['id_encounter'],
            required: false,
        }, {
            model: reg_periksa,
            as: 'reg',
            attributes: ['no_rkm_medis', 'kd_dokter', 'kd_poli'],
            include: [{
                model: pasien,
                as: 'pasien',
                attributes: ['no_ktp', 'nm_pasien']
            },
            {
                model: pegawai,
                as: 'pegawai',
                attributes: ['nama', 'no_ktp'],
            }, {
                model: satu_sehat_mapping_lokasi_ralan,
                as: 'satu_sehat_mapping_lokasi_ralan',
                attributes: ['id_organisasi_satusehat', 'id_lokasi_satusehat'],
                // required: false,
            }, {
                model: poliklinik,
                as: 'poliklinik',
                attributes: ['kd_poli', 'nm_poli']
            }
            ]
            }],
    })
    let count = 0;
    for (let x of dataFiletr) {
        console.log(x.no_rawat);
        console.log(x.reg.pasien.no_ktp);
        let code = {
            id: 'AMB',
            display: 'ambulatory'

        }
        let dataEndcounter = await postEncouter(x, code);
        if (dataEndcounter != undefined) {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Delay for 3 seconds
            console.log(dataEndcounter.id);
            count++;
            await satu_sehat_encounter.create({
                id_encounter: dataEndcounter.id,
                no_rawat: x.no_rawat
            })
        }

        // return;
    }
    console.log("data akan dikrirm " + dataFiletr.length);
    console.log("data dikirim " + count);

}
async function updateEncouterRalan(date) {
    let no_rawat = date.split("-").join("/");
    let encounter = await satu_sehat_encounter.findAll({
        where: {
            no_rawat: { [Op.startsWith]: no_rawat },
        }
    })
    let sudah = await client.lRange('rsud:encounter:finished:' + date, 0, -1,)

    let filtered = encounter.filter(item => !sudah.includes(item.no_rawat));
    let akanDikirim = filtered.length;
    console.log(akanDikirim)
    for (let item of filtered) {
        let dataEndcounter = await getEncounter(item.dataValues.id_encounter);
        console.log(item.dataValues.id_encounter + " " + dataEndcounter.status + " " + item.dataValues.no_rawat + " " + dataEndcounter.class.display);
        if (dataEndcounter.class.display == 'ambulatory') {
            if (dataEndcounter.status == 'finished') {
                await client.rPush('rsud:encounter:finished:' + date, dataEndcounter.identifier[0].value);
                await client.expire('rsud:encounter:finished:' + date, 60 * 60 * 12);
            }
            if (dataEndcounter.status == 'in-progress') {
                try {
                    dataEndcounter.status = 'finished';
                    let history = await getlisttask(dataEndcounter.identifier[0].value);
                    history = history.response;

                    let history4 = history.findIndex(obj => obj.taskid === 4);
                    let history5 = history.findIndex(obj => obj.taskid === 5);
                    let waktu4 = convertToISO3(history[history4].wakturs);
                    let waktu5 = convertToISO3(history[history5].wakturs);
                    dataEndcounter.period = {
                        start: waktu4,
                        end: waktu5
                    };
                    dataEndcounter.statusHistory.push({
                        period: {
                            start: waktu4,
                            end: waktu5
                        },
                        status: 'finished'
                    })
                    let datadiagnosis = await getStatus(item.dataValues.id_encounter, 'Condition');
                    dataEndcounter.diagnosis = [];
                    for (let x of datadiagnosis.entry) {
                        dataEndcounter.diagnosis.push({
                            "condition": {
                                "reference": "Condition/" + x.resource.id,
                                "display": x.resource.code.coding[0].display
                            },
                            "use": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/diagnosis-role",
                                        "code": "DD",
                                        "display": "Discharge diagnosis"
                                    }
                                ]
                            },
                            "rank": datadiagnosis.entry.indexOf(x) + 1,
                        })

                    }
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    let pushupdateEncounter = await updateEncounter(dataEndcounter, 'Encounter/' + item.dataValues.id_encounter);
                    console.log(pushupdateEncounter);
                }
                catch (err) {
                    console.log(err);
                }
                // let dataPut = await updateEncounter(data, 'Encounter/' + item.dataValues.id_encounter);
            }
            if (dataEndcounter.status == 'arrived') {
                try {
                    dataEndcounter.status = 'finished';
                    let history = await getlisttask(dataEndcounter.identifier[0].value);
                    history = history.response;

                    let history3 = history.findIndex(obj => obj.taskid === 3);
                    let history4 = history.findIndex(obj => obj.taskid === 4);
                    let history5 = history.findIndex(obj => obj.taskid === 5);
                    let waktu3 = convertToISO3(history[history3].wakturs);
                    let waktu4 = convertToISO3(history[history4].wakturs);
                    let waktu5 = convertToISO3(history[history5].wakturs);
                    dataEndcounter.period = {
                        start: waktu4,
                        end: waktu5
                    };
                    dataEndcounter.statusHistory.push({
                        period: {
                            start: waktu3,
                            end: waktu4
                        },
                        status: 'in-progress'
                    })
                    dataEndcounter.statusHistory.push({
                        period: {
                            start: waktu4,
                            end: waktu5
                        },
                        status: 'finished'
                    })
                    let datadiagnosis = await getStatus(item.dataValues.id_encounter, 'Condition');
                    dataEndcounter.diagnosis = [];
                    for (let x of datadiagnosis.entry) {
                        dataEndcounter.diagnosis.push({
                            "condition": {
                                "reference": "Condition/" + x.resource.id,
                                "display": x.resource.code.coding[0].display
                            },
                            "use": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/diagnosis-role",
                                        "code": "DD",
                                        "display": "Discharge diagnosis"
                                    }
                                ]
                            },
                            "rank": datadiagnosis.entry.indexOf(x) + 1,
                        })

                    }
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    let pushupdateEncounter = await updateEncounter(dataEndcounter, 'Encounter/' + item.dataValues.id_encounter);
                    console.log(pushupdateEncounter);
                }
                catch (err) {
                    console.log(err);
                }
                // let dataPut = await updateEncounter(data, 'Encounter/' + item.dataValues.id_encounter);

            }
        }
    }
    console.log("selesai");
}
// updateEncouterRalan("2025-01-04");

async function postEncouterIGD(date) {
    let dataFiletr = await reg_periksa.findAll({
        where: {
            tgl_registrasi: date,
            status_lanjut: 'Ralan',
            kd_poli: 'IGDK',
            '$encounter.id_encounter$': { [Op.is]: null },
        },
        attributes: ['no_rawat', 'tgl_registrasi', 'jam_reg'],
        include: [{
            model: satu_sehat_encounter,
            as: 'encounter',
            // attributes: ['id_encounter'],
            required: false,
        }, {
            model: pasien,
            as: 'pasien',
            attributes: ['no_ktp', 'nm_pasien']
        },
        {
            model: pegawai,
            as: 'pegawai',
            attributes: ['nama', 'no_ktp'],
        }, {
            model: satu_sehat_mapping_lokasi_ralan,
            as: 'satu_sehat_mapping_lokasi_ralan',
            attributes: ['id_organisasi_satusehat', 'id_lokasi_satusehat'],
            // required: false,
        }, {
            model: poliklinik,
            as: 'poliklinik',
            attributes: ['kd_poli', 'nm_poli']
        }],
        // limit: 1
    })
    let count = 0;
    for (let x of dataFiletr) {

        let datetime = new Date(x.dataValues.tgl_registrasi + "T" + x.dataValues.jam_reg + ".000Z").toISOString();
        let dataEX = {
            "resourceType": "Encounter",
            "status": "arrived",
            "class": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                "code": "EMER",
                "display": "emergency"
            },
            "location": [
                {
                    "location": {
                        "reference": "Location/" + x.dataValues.satu_sehat_mapping_lokasi_ralan.id_lokasi_satusehat,
                        "display": "IGD"
                    }
                }
            ],
            "serviceProvider": {
                "reference": "Organization/" + process.env.Organization_id_SATUSEHAT,
            },
            "identifier": [
                {
                    "system": "http://sys-ids.kemkes.go.id/encounter/" + process.env.Organization_id_SATUSEHAT,
                    "value": x.dataValues.no_rawat
                }
            ]

        };
        try {
            let drPractitioner = await getIHS('Practitioner', x.dataValues.pegawai.dataValues.no_ktp);
            let participant = [
                {
                    "type": [
                        {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                                    "code": "ATND",
                                    "display": "attender"
                                }
                            ]
                        }
                    ],
                    "individual": {
                        "reference": "Practitioner/" + drPractitioner.entry[0].resource.id,
                        "display": x.dataValues.pegawai.dataValues.nama
                    }
                }
            ]
            dataEX.participant = participant;
            let pxPatient = await getIHS('Patient', x.dataValues.pasien.dataValues.no_ktp);
            if (pxPatient.entry.length == 0) {
                console.log('Patient not found');
                continue;
            }
            let subject = {
                "reference": "Patient/" + pxPatient.entry[0].resource.id,
                "display": x.dataValues.pasien.dataValues.nm_pasien
            }
            dataEX.subject = subject;
        } catch (error) {
            continue;
        }
        let period = {
            "start": datetime,
            "end": datetime
        }
        dataEX.period = period;
        let statusHistory = [
            {
                "status": "arrived",
                "period": {
                    "start": datetime,
                    "end": datetime
                }
            },

        ]
        dataEX.statusHistory = statusHistory;
        console.log(json.stringify(dataEX));
        let dataEndcounter = await postData(dataEX, 'Encounter');
        if (dataEndcounter != undefined) {
            console.log(dataEndcounter.id);
            count++;
            let encoun = await satu_sehat_encounter.create({
                id_encounter: dataEndcounter.id,
                no_rawat: x.no_rawat
            })
            console.log(encoun.no_rawat);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 3 seconds
        } else {
            console.log(x.no_rawat);
        }
    }
    console.log("data akan dikrirm " + dataFiletr.length);
    console.log("data dikirim " + count);

}
// for (let i = 0; i < 9; i++) {
//     postEncouterIGD("2024-12-0" + i);
// }
// postEncouterIGD("2024-12-08");

async function postEncouterRanap(date) {
    let dataFiletr = await reg_periksa.findAll({
        where: {
            tgl_registrasi: date,
            status_lanjut: 'Ranap',
            // kd_poli: 'IGDK',
            '$encounter.id_encounter$': { [Op.is]: null },
        },
        attributes: ['no_rawat', 'tgl_registrasi', 'jam_reg'],
        include: [{
            model: satu_sehat_encounter,
            as: 'encounter',
            attributes: ['id_encounter'],
            required: false,
        }, {
                model: pasien,
                as: 'pasien',
                attributes: ['no_ktp', 'nm_pasien']
            },
            {
                model: pegawai,
                as: 'pegawai',
                attributes: ['nama', 'no_ktp'],
            }, {
                model: satu_sehat_mapping_lokasi_ralan,
                as: 'satu_sehat_mapping_lokasi_ralan',
                attributes: ['id_organisasi_satusehat', 'id_lokasi_satusehat'],
                // required: false,
            }, {
                model: poliklinik,
                as: 'poliklinik',
                attributes: ['kd_poli', 'nm_poli']
            },
            {
                model: kamar_inap,
                as: 'kamar_inap',
                // attributes: ['kd_kamar', 'tgl_masuk', 'jam_masuk', 'tgl_keluar', 'jam_keluar'],
                include: [{
                    model: satu_sehat_mapping_lokasi_ranap,
                    as: 'mapping_lokasi_ranap',
                }, {
                        model: kamar,
                        as: 'kode_kamar',
                        attributes: ['kd_bangsal'],
                        include: [{
                            model: bangsal,
                            as: 'bangsal',
                            attributes: ['nm_bangsal']
                        }]
                    }]
            }],
    })
    let code = {
        id: 'IMP',
        display: 'inpatient encounter'
    }
    // console.log(JSON.stringify(dataFiletr[0], null, 2));
    // await postEncouter2(dataFiletr[0], code);
    let count = 0;
    for (let x of dataFiletr) {
        console.log(x.no_rawat);
        let dataEndcounter = await postEncouter2(x, code);
        if (dataEndcounter != undefined) {
            console.log(dataEndcounter.id);
            count++;
            let encoun = await satu_sehat_encounter.create({
                id_encounter: dataEndcounter.id,
                no_rawat: x.no_rawat
            })
            // let diagnosis = await diagnosa_pasien.findAll({
            //     where: {
            //         no_rawat: x.no_rawat
            //     },
            //     include: [{
            //         model: penyakit,
            //         as: 'penyakit',
            //         attributes: ['kd_penyakit', 'nm_penyakit']
            //     }],
            //     order: [
            //         ['prioritas', 'ASC']]
            // })
            // console.log(diagnosis);
            console.log(encoun.no_rawat);
        } else {
            console.log(x.no_rawat);
        }
        // return;
    }
    console.log("data akan dikrirm " + dataFiletr.length);
    console.log("data dikirim " + count);
}
module.exports = { postEncouterRalan, postEncouterIGD, updateEncouterRalan };
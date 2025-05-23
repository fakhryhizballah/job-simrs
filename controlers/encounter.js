const { satu_sehat_encounter, satu_sehat_mapping_lokasi_ralan, satu_sehat_mapping_lokasi_ranap, resume_pasien_ranap, bangsal, poliklinik, reg_periksa, kamar_inap, kamar, pasien, pegawai, referensi_mobilejkn_bpjs_taskid, diagnosa_pasien, penyakit } = require("../models");
const { postEncouter, postEncouter2, postData, getIHS, postCondition, getEncounter, getStatus, updateEncounter } = require("../hooks/satusehat");
const { getlisttask, post } = require("../hooks/bpjs");
const { convertToISO, setStingTodate, convertToISO3 } = require("../helpers/");
const { Op } = require("sequelize");
require("dotenv").config();
const { createClient } = require("redis");
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_URL_PORT,
    },
});
client.connect();
// postEncouterRalan('2025-03-17');
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
        console.log(dataEndcounter);
        if (dataEndcounter != undefined) {
            console.log(dataEndcounter.id);
            count++;
            await satu_sehat_encounter.create({
                id_encounter: dataEndcounter.id,
                no_rawat: x.no_rawat,
                status: dataEndcounter.status,
                class: dataEndcounter.class.code
            })
            // return;
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
            // status: { [Op.ne]: ['finished'] }
        }
    })
    let sudah = await client.lRange('rsud:encounter:finished:' + date, 0, -1,)

    let filtered = encounter.filter(item => !sudah.includes(item.no_rawat));
    let akanDikirim = filtered.length;
    console.log(akanDikirim)
    for (let item of filtered) {
        // console.log(item.dataValues.status);
        if (item.dataValues.status == 'finished') {
            continue;
        }
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
                    // let history = await getlisttask(dataEndcounter.identifier[0].value);
                    // history = history.response;

                    // let history4 = history.findIndex(obj => obj.taskid === 4);
                    // let history5 = history.findIndex(obj => obj.taskid === 5);
                    // let waktu4 = convertToISO3(history[history4].wakturs);
                    // let waktu5 = convertToISO3(history[history5].wakturs);
                    let get_taksid = await referensi_mobilejkn_bpjs_taskid.findAll({
                        where: {
                            taskid: {
                                [Op.or]: [4, 5]
                            },
                            no_rawat: dataEndcounter.identifier[0].value.toString()
                        },
                        attributes: ['taskid', 'waktu']
                    })
                    if (get_taksid.length < 2) {
                        console.log('Belum Selsai Update');
                        continue;
                    }
                    // console.log(get_taksid);
                    let waktu4 = get_taksid[0].dataValues.waktu;
                    let waktu5 = get_taksid[1].dataValues.waktu;
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
                    let waktu3 = dataEndcounter.period.start
                    let waktu4 = dataEndcounter.period.start
                    let waktu5 = dataEndcounter.period.start
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
                    let pushupdateEncounter = await updateEncounter(dataEndcounter, 'Encounter/' + item.dataValues.id_encounter);
                    console.log(pushupdateEncounter);
                }
                catch (err) {
                    console.log(err);
                }
                // let dataPut = await updateEncounter(data, 'Encounter/' + item.dataValues.id_encounter);

            }
        }
        if (dataEndcounter.class.code == 'IMP') {
            if (dataEndcounter.status == 'finished') {
                await client.rPush('rsud:encounter:finished:' + date, dataEndcounter.identifier[0].value);
                await client.expire('rsud:encounter:finished:' + date, 60 * 60 * 12);
                continue;
            }
            try {
                let noRawat = dataEndcounter.identifier[0].value;
                let data_kamar_inap = await kamar_inap.findAll({
                    where: {
                        no_rawat: noRawat,
                    },
                    include: [{
                        model: satu_sehat_mapping_lokasi_ranap,
                        as: 'mapping_lokasi_ranap'
                    }, {
                        model: kamar,
                        as: 'kode_kamar'
                    }]
                });
                dataEndcounter.status = 'finished';
                dataEndcounter.period = {
                    start: new Date(data_kamar_inap[0].tgl_keluar + "T" + data_kamar_inap[0].jam_keluar + ".000Z").toISOString(),
                    end: new Date(data_kamar_inap[0].tgl_keluar + "T" + data_kamar_inap[0].jam_keluar + ".000Z").toISOString(),
                }
                let lastdata_kamar_inap = data_kamar_inap.length - 1;
                dataEndcounter.statusHistory.push({
                    period: {
                        start: new Date(data_kamar_inap[0].tgl_keluar + "T" + data_kamar_inap[0].jam_keluar + ".000Z").toISOString(),
                        end: new Date(data_kamar_inap[lastdata_kamar_inap].tgl_keluar + "T" + data_kamar_inap[lastdata_kamar_inap].jam_keluar + ".000Z").toISOString(),
                    },
                    status: 'finished'
                })

                let lama_inap = 0;
                for (let item of data_kamar_inap) {
                    let obj = {
                        "location": {
                            display: item.kd_kamar,
                            reference: 'Location/' + item.mapping_lokasi_ranap.id_lokasi_satusehat,
                        },
                        "period": {
                            start: new Date(item.tgl_masuk + "T" + item.jam_masuk + ".000Z").toISOString(),
                            end: new Date(item.tgl_keluar + "T" + item.jam_keluar + ".000Z").toISOString()
                        },
                        "extension": [
                            {
                                "url": "value",
                                "valueCodeableConcept": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.kemkes.go.id/CodeSystem/locationServiceClass-Inpatient",
                                            "code": item.kode_kamar.kelas.replace("Kelas ", ""),
                                            "display": item.kode_kamar.kelas
                                        }
                                    ]
                                }
                            }
                        ]
                    };
                    lama_inap += item.lama
                    dataEndcounter.location.push(obj);
                }
                dataEndcounter.length = {
                    "value": lama_inap,
                    "unit": "d",
                    "system": "http://unitsofmeasure.org",
                    "code": "d"
                }
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
                let resumeSingkat = await resume_pasien_ranap.findOne({
                    where: {
                        no_rawat: noRawat
                    },
                    attributes: ['edukasi']
                })
                console.log(resumeSingkat);
                dataEndcounter.hospitalization = {
                    "dischargeDisposition": {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/discharge-disposition",
                                "code": "home",
                                "display": "Home"
                            }
                        ],
                        "text": resumeSingkat.edukasi
                    }
                }
            }
            catch (err) {
                console.log(err);
            }
            console.log(JSON.stringify(dataEndcounter));
            // console.log(dataEndcounter);
            let pushupdateEncounter = await updateEncounter(dataEndcounter, 'Encounter/' + item.dataValues.id_encounter);
            console.log(pushupdateEncounter);
            // return;
        }
    }
    console.log("selesai");
}
// updateEncouterRalan("2025-03-15");

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
        console.log(JSON.stringify(dataEX, null, 2));
        let dataEndcounter = await postData(dataEX, 'Encounter');
        if (dataEndcounter != undefined) {
            console.log(dataEndcounter.data.id);
            count++;
            let encoun = await satu_sehat_encounter.create({
                id_encounter: dataEndcounter.data.id,
                no_rawat: x.no_rawat,
                status: dataEndcounter.data.status,
                class: dataEndcounter.data.class.code
            })
            console.log(encoun.no_rawat);
        } else {
            console.log(x.no_rawat);
        }
    }
    console.log("data akan dikrirm " + dataFiletr.length);
    console.log("data dikirim " + count);

}

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
            // {
            //     model: kamar_inap,
            //     as: 'kamar_inap',
            //     // attributes: ['kd_kamar', 'tgl_masuk', 'jam_masuk', 'tgl_keluar', 'jam_keluar'],
            //     include: [{
            //         model: satu_sehat_mapping_lokasi_ranap,
            //         as: 'mapping_lokasi_ranap',
            //     }, {
            //             model: kamar,
            //             as: 'kode_kamar',
            //             attributes: ['kd_bangsal'],
            //             include: [{
            //                 model: bangsal,
            //                 as: 'bangsal',
            //                 attributes: ['nm_bangsal']
            //             }]
            //         }]
            // }
        ],
    })

    // console.log(JSON.stringify(dataFiletr[0], null, 2));
    // await postEncouter2(dataFiletr[0], code);
    let count = 0;
    for (let x of dataFiletr) {
        console.log(x);

        let datetime = new Date(x.dataValues.tgl_registrasi + "T" + x.dataValues.jam_reg + ".000Z").toISOString();
        let dataEX = {
            "resourceType": "Encounter",
            "status": "arrived",
            "class": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                "code": "IMP",
                "display": "inpatient encounter"
            },
            "location": [
                {
                    "location": {
                        "reference": "Location/" + x.dataValues.satu_sehat_mapping_lokasi_ralan.id_lokasi_satusehat,
                        "display": x.dataValues.poliklinik.nm_poli
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
            console.log(x.dataValues.pasien.dataValues.no_ktp);
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
        console.log(dataEX);
        console.log(JSON.stringify(dataEX, null, 2));
        let dataEndcounter = await postData(dataEX, 'Encounter');
        if (dataEndcounter != undefined) {
            console.log(dataEndcounter.data.id);
            console.log(dataEndcounter.data.class);
            count++;
            let encoun = await satu_sehat_encounter.create({
                id_encounter: dataEndcounter.data.id,
                no_rawat: x.no_rawat,
                status: dataEndcounter.data.status,
                class: dataEndcounter.data.class.code
            })
            console.log(encoun.no_rawat);
        } else {
            console.log(x.no_rawat);
        }
        // return;
    }
    console.log("data akan dikrirm " + dataFiletr.length);
    // console.log("data dikirim " + count);
}
// postEncouterRanap("2024-07-16");
module.exports = { postEncouterRalan, postEncouterRanap, postEncouterIGD, updateEncouterRalan };
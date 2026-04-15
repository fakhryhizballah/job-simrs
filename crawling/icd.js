const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const Patient = require("../modelsMongoose/Patient");
const Encounter = require("../modelsMongoose/Encounter");
const KFA = require("../modelsMongoose/Kfa");
const Medication = require("../modelsMongoose/Medication");
const MedicationRequest = require("../modelsMongoose/MedicationRequest");
const Condition = require("../modelsMongoose/Condition");
const Procedure = require("../modelsMongoose/Procedure");
const { getPesertabyKatu } = require("../hooks/bpjs");
const { fetchSatusehat, fetchSatusehatPatch } = require("../hooks/satusehat");
const { findBestMatchKFA } = require("../helpers/");
const Org_id = process.env.Organization_id_SATUSEHAT

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Terhubung ke MongoDB!'))
    .catch(err => console.error('Gagal terhubung ke MongoDB:', err));
const { satu_sehat_encounter, satu_sehat_condition, satu_sehat_procedure, diagnosa_pasien, penyakit, prosedur_pasien, icd9 } = require("../models");
const { getEncounter, postData } = require("../hooks/satusehat");
const { Op } = require("sequelize");


async function pCondition(date) {
    let dateFormatted = date.split("-").join("/").replace(/-/g, "/");
    console.log("Processing Date/No Rawat:", dateFormatted);
    const encounters = await Encounter.find({
        'identifier.value': { $regex: new RegExp(`^${dateFormatted}`) },
        'diagnosis': { $exists: false }
    });

    for (let x of encounters) {
        let findCondition = await Condition.find({
            'encounter.reference': `Encounter/${x.id}`
        })
        if (findCondition.length === 0) {
            let findConditionSatuSehat = await fetchSatusehat('GET', `Condition?encounter=Encounter/${x.id}`)
            if (findConditionSatuSehat.total !== 0) {
                const bulkOps = findConditionSatuSehat.entry.map(item => ({
                    replaceOne: {
                        filter: { id: item.resource.id },
                        replacement: item.resource,
                        upsert: true
                    }
                }));
                await Condition.bulkWrite(bulkOps);
                console.log('Data Di simpan dari satu sehat');
                let diagnosa_pasien = []
                for (let y of findConditionSatuSehat.entry) {
                    diagnosa_pasien.push({
                        "condition": {
                            "display": y.resource.code.coding[0].display,
                            "reference": "Condition/" + y.resource.id
                        },
                        "use": {
                            "coding": [
                                {
                                    "code": "DD",
                                    "display": "Discharge diagnosis",
                                    "system": "http://terminology.hl7.org/CodeSystem/diagnosis-role"
                                }
                            ]
                        }
                    })
                }
                let addDiagnosis = [
                    {
                        "op": "add",
                        "path": "/diagnosis",
                        "value": diagnosa_pasien
                    }
                ]

                let updateEncounter = await fetchSatusehatPatch("PATCH", `Encounter/${x.id}`, addDiagnosis);
                await Encounter.updateOne({ id: x.id }, { diagnosis: updateEncounter.diagnosis, meta: updateEncounter.meta })
            }
            else {
                console.log('Data Tidak Di temukan di satu sehat', x.identifier.find(id => id.system.includes('encounter')).value);
                let dataCondition = await diagnosa_pasien.findAll({
                    where: {
                        no_rawat: x.identifier.find(id => id.system.includes('encounter')).value
                    },
                    order: [
                        ['prioritas', 'ASC']
                    ],
                    attributes: ['no_rawat', 'kd_penyakit', 'status', 'prioritas', 'status_penyakit'],
                    include: [{
                        model: penyakit,
                        as: 'penyakit',
                        attributes: ['kd_penyakit', 'nm_penyakit']
                    }]
                })
                console.log(JSON.stringify(dataCondition, null, 2))
                if (dataCondition.length > 0) {
                    for (let y of dataCondition) {
                        console.log(JSON.stringify(x, null, 2))
                        let data = {
                            "resourceType": "Condition",
                            "clinicalStatus": {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                                        "code": "active",
                                        "display": "Active"
                                    }
                                ]
                            },
                            "category": [
                                {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                                            "code": "encounter-diagnosis",
                                            "display": "Encounter Diagnosis"
                                        }
                                    ]
                                }
                            ],
                            "code": {
                                "coding": [
                                    {
                                        "system": "http://hl7.org/fhir/sid/icd-10",
                                        "code": y.kd_penyakit,
                                        "display": y.penyakit.nm_penyakit
                                    }
                                ]
                            },
                            "subject": x.subject,
                            "encounter": {
                                "reference": "Encounter/" + x.id,
                                "display": x.identifier.find(id => id.system.includes('encounter')).value
                            }
                        }
                        console.log(JSON.stringify(data, null, 2))
                        const kirimCondition = await fetchSatusehat("POST", `Condition`, data);
                        // console.log(JSON.stringify(kirimCondition, null, 2))
                        if (kirimCondition.id) {
                            await Condition.create(kirimCondition);
                            console.log("SUCCESS:", kirimCondition.id);
                            let diagnosapasien = {
                                "condition": {
                                    "display": y.penyakit.nm_penyakit,
                                    "reference": "Condition/" + kirimCondition.id
                                },
                                "rank": y.prioritas,
                                "use": {
                                    "coding": [
                                        {
                                            "code": "DD",
                                            "display": "Discharge diagnosis",
                                            "system": "http://terminology.hl7.org/CodeSystem/diagnosis-role"
                                        }
                                    ]
                                }
                            }
                            if (y.prioritas == 1) {
                                let addDiagnosis = [
                                    {
                                        "op": "add",
                                        "path": "/diagnosis",
                                        "value": [diagnosapasien]
                                    }
                                ]

                                let updateEncounter = await fetchSatusehatPatch("PATCH", `Encounter/${x.id}`, addDiagnosis);
                                console.log(JSON.stringify(updateEncounter, null, 2))
                            } else {
                                let addDiagnosis = [
                                    {
                                        "op": "add",
                                        "path": "/diagnosis/0",
                                        "value": diagnosapasien
                                    }
                                ]
                                let updateEncounter = await fetchSatusehatPatch("PATCH", `Encounter/${x.id}`, addDiagnosis);
                                console.log(JSON.stringify(updateEncounter, null, 2))
                            }
                        } else {
                            console.error("FAILED for:", y.penyakit.nm_penyakit, JSON.stringify(kirimCondition.response || kirimCondition, null, 2));
                        }
                    }
                }

            }
        } else {
            console.log('Data Sudah Ada');
            let getEncounter = await fetchSatusehat('GET', `Encounter/${x.id}`)
            console.log(JSON.stringify(getEncounter, null, 2))
            await Encounter.updateOne({ id: x.id }, { diagnosis: getEncounter.diagnosis, meta: getEncounter.meta })
        } 
    }
    console.log('Selesai', date)
}
// pCondition('2024-11-28');
// pCondition('2023/08/14/000189');
// pCondition('2026/01/03');
async function pProcedure(date) {
    let dateFormatted = date.split("-").join("/").replace(/-/g, "/");
    console.log("Processing Date/No Rawat:", dateFormatted);
    const encounter = await Encounter.aggregate([
        [
            {
                '$match': {
                    'identifier.value': {
                        '$regex': new RegExp(`^${dateFormatted}`)
                    }
                }
            }, {
                '$lookup': {
                    'from': 'Condition',
                    'let': {
                        'encounterId': '$id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$encounter.reference', {
                                            '$concat': [
                                                'Encounter/', '$$encounterId'
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    'as': 'matchedProsedure'
                }
            }, {
                '$match': {
                    'matchedProsedure.0': {
                        '$exists': false
                    }
                }
            }
        ]
    ])
    // console.log(JSON.stringify(encounter, null, 2))
    console.log(encounter.length)
    // const encounters = await Encounter.find({
    //     'identifier.value': { $regex: new RegExp(`^${dateFormatted}`) },
    // });

    // for (let x of encounters) {
    //     let findProcedure = await Procedure.find({
    //         'encounter.reference': `Encounter/${x.id}`
    //     })
    //     if (findProcedure.length === 0) {
    //         let findProcedureSatuSehat = await fetchSatusehat('GET', `Procedure?encounter=Encounter/${x.id}`)
    //         if (findProcedureSatuSehat.total !== 0) {
    //             const bulkOps = findProcedureSatuSehat.entry.map(item => ({
    //                 replaceOne: {
    //                     filter: { id: item.resource.id },
    //                     replacement: item.resource,
    //                     upsert: true
    //                 }
    //             }));
    //             await Procedure.bulkWrite(bulkOps);
    //             console.log('Data Di simpan dari satu sehat');
    //         }
    //         else {
    //             console.log('Data Tidak Di temukan di satu sehat');
    //         }
    //     }
    //     else {
    //         console.log('Data Sudah Ada');
    //     }
    // }
}
// pProcedure('2024-11-28')
pProcedure('2026/01/03');

module.exports = {
    pCondition,
    pProcedure
}
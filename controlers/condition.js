const { satu_sehat_encounter, satu_sehat_condition, satu_sehat_procedure, diagnosa_pasien, penyakit, prosedur_pasien, icd9 } = require("../models");
const { getEncounter, postData } = require("../hooks/satusehat");
const { Op } = require("sequelize");


async function pCondition(date) {
    let no_rawat = date.split("-").join("/");
    let encounter = await satu_sehat_encounter.findAll({
        where: {
            no_rawat: { [Op.startsWith]: no_rawat },
        },
        include: [{
            model: diagnosa_pasien,
            as: 'diagnosa_pasien',
            include: [{
                model: penyakit,
                as: 'penyakit'
            }]
        }]
    })
    // console.log(encounter);
    // console.log(JSON.stringify(encounter[0], null, 2));
    for (let item of encounter) {
        let dataEncounter = await getEncounter(item.dataValues.id_encounter);
        let subject = {
            "reference": dataEncounter.subject.reference,
        }
        let encounter = {
            "reference": "Encounter/" + item.dataValues.id_encounter,
        }
        for (let x of item.diagnosa_pasien) {
            let code = {
                "coding": [{
                    "system": "http://hl7.org/fhir/sid/icd-10",
                    "code": x.penyakit.dataValues.kd_penyakit,
                    "display": x.penyakit.dataValues.nm_penyakit
                }]
            }
            let resource = {
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
                "code": code,
                "subject": subject,
                "encounter": encounter
            }
            let result = await postData(resource, 'Condition');
            console.log(result);
            try {
                await satu_sehat_condition.create({
                    no_rawat: item.dataValues.no_rawat,
                    kd_penyakit: x.penyakit.dataValues.kd_penyakit,
                    status: 'Ralan',
                    id_condition: result.data.id,
                })
            } catch (error) {
                console.log(error);
            }
        }

    }
}
// pCondition('2025-01-02')
async function pProcedure(date) {
    let no_rawat = date.split("-").join("/");
    let encounter = await satu_sehat_encounter.findAll({
        where: {
            no_rawat: { [Op.startsWith]: no_rawat },
        },
        include: [{
            model: prosedur_pasien,
            as: 'prosedur_pasien',
            include: [{
                model: icd9,
                as: 'prosedur'
            }]
        }]
    })

    for (let item of encounter) {
        let dataEncounter = await getEncounter(item.dataValues.id_encounter);
        let subject = {
            "reference": dataEncounter.subject.reference,
        }
        let encounter = {
            "reference": "Encounter/" + item.dataValues.id_encounter,
        }
        for (let x of item.prosedur_pasien) {
            let code = {
                "coding": [{
                    "system": "http://hl7.org/fhir/sid/icd-9-cm",
                    "code": x.prosedur.dataValues.kode,
                    "display": x.prosedur.dataValues.deskripsi_panjang
                }]
            }
            let resource = {
                "resourceType": "Procedure",
                "status": "completed",
                "category": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "103693007",
                            "display": "Diagnostic procedure"
                        }
                    ],
                    "text": "Diagnostic procedure"
                },
                "code": code,
                "subject": subject,
                "encounter": encounter
            }
            console.log(resource);
            let result = await postData(resource, 'Procedure');
            console.log(result);
            try {
                await satu_sehat_procedure.create({
                    no_rawat: item.dataValues.no_rawat,
                    kode: x.prosedur.dataValues.kode,
                    status: 'Ralan',
                    id_procedure: result.data.id,
                })
            } catch (error) {
                console.log(error);
            }
        }

    }
}
pProcedure('2025-01-02')
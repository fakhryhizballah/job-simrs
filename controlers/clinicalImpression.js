const { satu_sehat_encounter, pemeriksaan_ralan, pegawai, satu_sehat_clinicalimpression } = require("../models");
const { getIHS, getEncounter, getStatus, postData } = require("../hooks/satusehat");
const { convertToISO2 } = require("../helpers/");
const { Op } = require("sequelize");
const { createClient } = require("redis");
require('dotenv').config()
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_URL_PORT,
    },
});
client.connect();
async function pClinicalImpression(date) {
    let no_rawat = date.split("-").join("/");
    let data_pemeriksaan_ralan = await pemeriksaan_ralan.findAll({
        where: {
            no_rawat: { [Op.startsWith]: no_rawat },
            '$encounter.id_encounter$': { [Op.ne]: null },
        },
        include: [{
            model: pegawai,
            as: 'pegawai',
            attributes: ['nama', 'no_ktp']
        },
        {
            model: satu_sehat_encounter,
            as: 'encounter',
            required: false,
        }],
    })
    let sudah = await client.lRange('rsud:ClinicalImpression:' + date, 0, -1,)

    let filtered = data_pemeriksaan_ralan.filter(item => !sudah.includes(item.no_rawat));
    let akanDikirim = filtered.length;
    console.log(akanDikirim)
    let terkirim = 0;
    for (let i of filtered) {
        console.log(i.encounter.dataValues.id_encounter)
        console.log(i.no_rawat)

        let Practitioner = await getIHS('Practitioner', i.pegawai.dataValues.no_ktp);
        let dataEncounter = await getEncounter(i.encounter.dataValues.id_encounter);
        let finding = [];
        let refconditon = await getStatus(i.encounter.dataValues.id_encounter, 'Condition')
        for (let r of refconditon.entry) {
            let itemCodeableConcept = {
                "coding": r.resource.code.coding
            }
            let itemReference = {
                "reference": "Condition/" + r.resource.id
            }
            finding.push({ "itemCodeableConcept": itemCodeableConcept, "itemReference": itemReference })

        }
        let subject = {
            "reference": dataEncounter.subject.reference,
        }
        let assessor = {
            "reference": "Practitioner/" + Practitioner.entry[0].resource.id,
        }
        let encounter = {
            "reference": "Encounter/" + i.encounter.dataValues.id_encounter,
        }
        let description = i.keluhan.replace(/(\r\n|\r|\n|\n\r)/g, '<br>')
            .replace(/\t/g, ' '); + ' ' + i.pemeriksaan.replace(/(\r\n|\r|\n|\n\r)/g, '<br>')
                .replace(/\t/g, ' ');
        let summary = i.penilaian.replace(/(\r\n|\r|\n|\n\r)/g, '<br>')
        let prognosisCodeableConcept = [
            {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": "170968001",
                        "display": "Prognosis good"
                    }
                ]
            }
        ]
        let dateTime = convertToISO2(i.tgl_perawatan + ' ' + i.jam_rawat)
        let effectiveDateTime = dateTime
        let resource = {
            "resourceType": "ClinicalImpression",
            "identifier": [
                {
                    "system": "http://sys-ids.kemkes.go.id/clinicalimpression/" + process.env.Organization_id_SATUSEHAT,
                    "use": "official",
                    "value": i.no_rawat
                }
            ],
            "status": "completed",
            "description": description,
            "summary": summary,
            "finding": finding,
            "assessor": assessor,
            "subject": subject,
            "encounter": encounter,
            "prognosisCodeableConcept": prognosisCodeableConcept,
            "effectiveDateTime": effectiveDateTime
        }
        try {
            let result = await postData(resource, 'ClinicalImpression');
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log(result);
            terkirim++;
            await satu_sehat_clinicalimpression.create({
                no_rawat: i.no_rawat,
                tgl_perawatan: i.tgl_perawatan,
                jam_rawat: i.jam_rawat,
                status: 'Ralan',
                id_clinicalimpression: result.data.id,
            })
        } catch (error) {
            console.log(error)
        }
        await client.rPush('rsud:ClinicalImpression:' + date, i.no_rawat);
        await client.expire('rsud:ClinicalImpression:' + date, 60 * 60 * 12);

    }

    console.log('akan dikirim = ' + akanDikirim)
    console.log('dikirm = ' + terkirim)

}
// pClinicalImpression('2025-01-02')

async function pCompositionResumeRalan(date) {
    let no_rawat = date.split("-").join("/");
    let data_pemeriksaan_ralan = await pemeriksaan_ralan.findAll({
        where: {
            no_rawat: { [Op.startsWith]: no_rawat },
            '$encounter.id_encounter$': { [Op.ne]: null },
        },
        include: [{
            model: pegawai,
            as: 'pegawai',
            attributes: ['nama', 'no_ktp']
        },
        {
            model: satu_sehat_encounter,
            as: 'encounter',
            required: false,
        }],

    })
    let sudah = await client.lRange('rsud:CompositionResumeRalan:' + date, 0, -1,)

    let filtered = data_pemeriksaan_ralan.filter(item => !sudah.includes(item.no_rawat));
    let akanDikirim = filtered.length;
    console.log(akanDikirim)
    let terkirim = 0;
    for (let i of filtered) {
        console.log(i.encounter.dataValues.id_encounter)
        console.log(i.no_rawat)

        let Practitioner = await getIHS('Practitioner', i.pegawai.dataValues.no_ktp);
        let dataEncounter = await getEncounter(i.encounter.dataValues.id_encounter);
        let subject = {
            "reference": dataEncounter.subject.reference,
        }
        let author = [{
            "reference": "Practitioner/" + Practitioner.entry[0].resource.id,
        }]
        let encounter = {
            "reference": "Encounter/" + i.encounter.dataValues.id_encounter,
        }
        let dateTime = convertToISO2(i.tgl_perawatan + ' ' + i.jam_rawat)
        let effectiveDateTime = dateTime
        let resource = {
            "resourceType": "Composition",
            "identifier": [
                {
                    "system": "http://sys-ids.kemkes.go.id/composition/" + process.env.Organization_id_SATUSEHAT,
                    "value": i.no_rawat
                }
            ],
            "status": "final",
            "type": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "18842-5",
                        "display": "Discharge summary"
                    }
                ]
            },
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "LP173421-1",
                            "display": "Report"
                        }
                    ]
                }
            ],
            "author": author,
            "subject": subject,
            "encounter": encounter,
            "date": effectiveDateTime,
            "title": "Resume Medis Rawat Jalan",
            "section": [
                {
                    "title": "Anamnesis",
                    "code": {
                        "coding": [
                            {
                                "system": "http://terminology.kemkes.go.id",
                                "code": "TK000003",
                                "display": "Anamnesis"
                            }
                        ]
                    },
                    "text": {
                        "status": "additional",
                        "div": i.pemeriksaan
                    }
                },
                {
                    "title": "Keluhan Utama",
                    "code": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "10154-3",
                                "display": "Chief complaint Narrative - Reported"
                            }
                        ]
                    },
                    "text": {
                        "status": "additional",
                        "div": i.keluhan
                    }

                }
            ]
        }
        try {
            let result = await postData(resource, 'Composition');
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(result);
            terkirim++;
        } catch (error) {
            console.log(error)
        }
        await client.rPush('rsud:CompositionResumeRalan:' + date, i.no_rawat);
        await client.expire('rsud:CompositionResumeRalan:' + date, 60 * 60 * 12);

    }
}
// pCompositionResumeRalan('2023-08-14')
module.exports = pClinicalImpression;
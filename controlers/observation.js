const { satu_sehat_encounter, pemeriksaan_ralan, pegawai, satu_sehat_observationttvnadi, satu_sehat_observationttvbb, satu_sehat_observationttvtb, satu_sehat_observationttvgcs, satu_sehat_observationttvrespirasi, satu_sehat_observationttvspo2, satu_sehat_observationttvtensi, satu_sehat_observationttvkesadaran } = require("../models");
const { postObservation, postObservationTensi, postObservationExam, getIHS, getEncounter, getCondition } = require("../hooks/satusehat");
const { convertToISO2 } = require("../helpers/");
const { Op } = require("sequelize");
const { model } = require("mongoose");
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


async function pObservation(date) {
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
    let sudah = await client.lRange('rsud:Observation:' + date, 0, -1,)

    let filtered = data_pemeriksaan_ralan.filter(item => !sudah.includes(item.no_rawat));
    let akanDikirim = filtered.length;
    console.log(akanDikirim)
    let terkirim = 0;


    for (let i of filtered) {
        let cekCondition = await getCondition(i.encounter.dataValues.id_encounter);
        console.log(cekCondition.total)
        if (cekCondition.total == 0) {
            let Practitioner = await getIHS('Practitioner', i.pegawai.dataValues.no_ktp);
            let dataEncounter = await getEncounter(i.encounter.dataValues.id_encounter);
            let subject = {
                "reference": dataEncounter.subject.reference,
            }
            let performer = [{
                "reference": "Practitioner/" + Practitioner.entry[0].resource.id,
            }]
            let encounter = {
                "reference": "Encounter/" + i.encounter.dataValues.id_encounter,
            }
            let dateTime = convertToISO2(i.tgl_perawatan + ' ' + i.jam_rawat)
            let effectiveDateTime = dateTime
            let issued = dateTime
            console.log(subject)
            if (i.suhu_tubuh !== '') {
                let code = {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "8310-5",
                            "display": "Body temperature"
                        }
                    ]
                }
                let valueQuantity = {
                    "value": parseInt(i.suhu_tubuh),
                    "unit": "degree Celsius",
                    "system": "http://unitsofmeasure.org",
                    "code": "Cel"
                }
                try {
                    let result = await postObservation(code, subject, performer, encounter, effectiveDateTime, issued, valueQuantity)
                    console.log(result);
                    await satu_sehat_observationttvbb.create({
                        no_rawat: i.no_rawat,
                        tgl_perawatan: i.tgl_perawatan,
                        jam_rawat: i.jam_rawat,
                        status: 'Ralan',
                        id_observation: result.data.id,
                    })
                }
                catch (error) {
                    console.log(error);
                }
            }
            if (i.tensi !== '') {
                let code = {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "35094-2",
                            "display": "Blood pressure panel"
                        },

                    ], "text": "Blood pressure systolic & diastolic"
                }
                let component = [{
                    "code": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "8480-6",
                                "display": "Systolic blood pressure"
                            }
                        ]
                    },
                    "valueQuantity": {
                        "value": parseInt(i.tensi.split('/')[0]),
                        "unit": "mm[Hg]",
                        "system": "http://unitsofmeasure.org",
                        "code": "mm[Hg]"
                    },
                }, {
                    "code": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "8462-4",
                                "display": "Diastolic blood pressure"
                            }
                        ]
                    },
                    "valueQuantity": {
                        "value": parseInt(i.tensi.split('/')[1]),
                        "unit": "mm[Hg]",
                        "system": "http://unitsofmeasure.org",
                        "code": "mm[Hg]"
                    },
                }
                ]
                try {

                    let result = await postObservationTensi(code, subject, performer, encounter, effectiveDateTime, issued, component)
                    console.log(result);
                    await satu_sehat_observationttvtensi.create({
                        no_rawat: i.no_rawat,
                        tgl_perawatan: i.tgl_perawatan,
                        jam_rawat: i.jam_rawat,
                        status: 'Ralan',
                        id_observation: result.data.id,
                    })
                } catch (error) {
                    console.log(error);
                }
            }
            if (i.nadi !== '') {
                let code = {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "8867-4",
                            "display": "Heart rate"
                        }
                    ]
                }
                let valueQuantity = {
                    "value": parseInt(i.nadi),
                    "unit": "/min",
                    "system": "http://unitsofmeasure.org",
                    "code": "/min"
                }
                try {
                    let result = await postObservation(code, subject, performer, encounter, effectiveDateTime, issued, valueQuantity)
                    console.log(result);
                    await satu_sehat_observationttvnadi.create({
                        no_rawat: i.no_rawat,
                        tgl_perawatan: i.tgl_perawatan,
                        jam_rawat: i.jam_rawat,
                        status: 'Ralan',
                        id_observation: result.data.id,
                    })
                } catch (error) {
                    console.log(error);
                }
            }
            if (i.respirasi !== '') {
                let code = {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "9279-1",
                            "display": "Respiratory rate"
                        }
                    ]
                }
                let valueQuantity = {
                    "value": parseInt(i.respirasi),
                    "unit": "breaths/minute",
                    "system": "http://unitsofmeasure.org",
                    "code": "/min"
                }
                try {
                    let result = await postObservation(code, subject, performer, encounter, effectiveDateTime, issued, valueQuantity)
                    console.log(result);
                    await satu_sehat_observationttvrespirasi.create({
                        no_rawat: i.no_rawat,
                        tgl_perawatan: i.tgl_perawatan,
                        jam_rawat: i.jam_rawat,
                        status: 'Ralan',
                        id_observation: result.data.id,
                    })
                } catch (error) {
                    console.log(error);
                }
            }
            if (i.tinggi !== '') {
                let code = {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "8302-2",
                            "display": "Body height"
                        }
                    ]
                }
                let valueQuantity = {
                    "value": parseInt(i.tinggi),
                    "unit": "centimeter",
                    "system": "http://unitsofmeasure.org",
                    "code": "cm"
                }
                try {
                    let result = await postObservation(code, subject, performer, encounter, effectiveDateTime, issued, valueQuantity)
                    console.log(result);
                    await satu_sehat_observationttvtb.create({
                        no_rawat: i.no_rawat,
                        tgl_perawatan: i.tgl_perawatan,
                        jam_rawat: i.jam_rawat,
                        status: 'Ralan',
                        id_observation: result.data.id,
                    })
                } catch (error) {
                    console.log(error);
                }
            }
            if (i.berat !== '') {
                let code = {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "29463-7",
                            "display": "Body Weight"
                        }
                    ]
                }
                let valueQuantity = {
                    "value": parseInt(i.berat),
                    "unit": "kilogram",
                    "system": "http://unitsofmeasure.org",
                    "code": "kg"
                }
                try {
                    let result = await postObservation(code, subject, performer, encounter, effectiveDateTime, issued, valueQuantity)
                    console.log(result);
                    await satu_sehat_observationttvbb.create({
                        no_rawat: i.no_rawat,
                        tgl_perawatan: i.tgl_perawatan,
                        jam_rawat: i.jam_rawat,
                        status: 'Ralan',
                        id_observation: result.data.id,
                    })
                }
                catch (error) {
                    console.log(error);
                }

            }
            if (i.spo2 !== '') {
                let code = {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "59408-5",
                            "display": "Oxygen saturation"
                        }
                    ]
                }
                let valueQuantity = {
                    "value": parseInt(i.spo2),
                    "unit": "percent saturation",
                    "system": "http://unitsofmeasure.org",
                    "code": "%"
                }
                try {
                    let result = await postObservation(code, subject, performer, encounter, effectiveDateTime, issued, valueQuantity)
                    console.log(result);
                    await satu_sehat_observationttvspo2.create({
                        no_rawat: i.no_rawat,
                        tgl_perawatan: i.tgl_perawatan,
                        jam_rawat: i.jam_rawat,
                        status: 'Ralan',
                        id_observation: result.data.id,
                    })
                } catch (error) {
                    console.log(error);
                }
            }
            if (i.gcs !== '') {
                let code = {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "59408-5",
                            "display": "Glasgow coma score total"
                        }
                    ]
                }
                let valueQuantity = {
                    "value": parseInt(i.gcs),
                    "system": "http://unitsofmeasure.org",
                    "code": "{score}"
                }
                try {
                    let result = await postObservation(code, subject, performer, encounter, effectiveDateTime, issued, valueQuantity)
                    console.log(result);
                    await satu_sehat_observationttvgcs.create({
                        no_rawat: i.no_rawat,
                        tgl_perawatan: i.tgl_perawatan,
                        jam_rawat: i.jam_rawat,
                        status: 'Ralan',
                        id_observation: result.data.id,
                    })
                } catch (error) {
                    console.log(error);
                }
            }
            if (i.kesadaran !== '') {
                let valueCodeableConcept = {
                    "text": i.kesadaran
                }
                try {
                    let result = await postObservationExam(subject, performer, encounter, effectiveDateTime, valueCodeableConcept)
                    console.log(result);
                    await satu_sehat_observationttvkesadaran.create({
                        no_rawat: i.no_rawat,
                        tgl_perawatan: i.tgl_perawatan,
                        jam_rawat: i.jam_rawat,
                        status: 'Ralan',
                        id_observation: result.data.id,
                    })
                } catch (error) {
                    console.log(error);
                }
            }
            terkirim++;
        }
        await client.rPush('rsud:Observation:' + date, i.no_rawat);
        await client.expire('rsud:Observation:' + date, 60 * 60 * 12);

    }

    console.log('akan dikirim = ' + akanDikirim)
    console.log('dikirm = ' + terkirim)
}
pObservation('2025-01-02');
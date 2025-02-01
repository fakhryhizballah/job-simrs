const { data_triase_igd, data_triase_igdprimer, data_triase_igdsekunder, penilaian_awal_keperawatan_igd, satu_sehat_encounter, pemeriksaan_ralan, pegawai, satu_sehat_observationttvnadi, satu_sehat_observationttvbb, satu_sehat_observationttvtb, satu_sehat_observationttvgcs, satu_sehat_observationttvrespirasi, satu_sehat_observationttvspo2, satu_sehat_observationttvtensi, satu_sehat_observationttvkesadaran } = require("../models");
const { postObservation, postObservationTensi, postObservationExam, getIHS, getEncounter, postData, updateEncounter, getStatus } = require("../hooks/satusehat");
const { convertToISO2, convertToISO3 } = require("../helpers/");
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
        console.log(i.encounter.dataValues.id_encounter)
        console.log(i.no_rawat)

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
        await new Promise(resolve => setTimeout(resolve, 1000));
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

        await client.rPush('rsud:Observation:' + date, i.no_rawat);
        await client.expire('rsud:Observation:' + date, 60 * 60 * 12);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Delay for 3 seconds


    }

    console.log('akan dikirim = ' + akanDikirim)
    console.log('dikirm = ' + terkirim)
}
async function ObservationNyeriIGD(date) {
    let no_rawat = date.split("-").join("/");
    let dataTriase = await data_triase_igd.findAll({
        where: {
            no_rawat: { [Op.startsWith]: no_rawat },
            '$encounter.id_encounter$': { [Op.ne]: null },
        },
        include: [
            {
                model: satu_sehat_encounter,
                as: 'encounter',
                required: false,
            }]
    })
    for (let item of dataTriase) {
        console.log(item.tgl_kunjungan);
        const date = new Date(item.tgl_kunjungan);

        // Konversi ke zona waktu +07:00
        const options = {
            timeZone: "Asia/Jakarta", // GMT+7
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        };

        // Format waktu dengan offset +07:00
        const formatter = new Intl.DateTimeFormat("sv-SE", options);
        const formattedDate = formatter.format(date).replace(" ", "T");
        let datetime = formattedDate + "+07:00";
        let dataEndcounter = await getEncounter(item.encounter.id_encounter);
        if (dataEndcounter.status == 'finished') {
            continue;
        }
        dataEndcounter.status = 'finished';
        dataEndcounter.period = {
            start: datetime,
            end: datetime
        };
        const arrivedStatuses = dataEndcounter.statusHistory.filter(entry => entry.status === "arrived");
        console.log(arrivedStatuses[0].period.start);
        const indexStatusHistory = dataEndcounter.statusHistory.findIndex(entry => entry.status === "arrived");
        dataEndcounter.statusHistory[indexStatusHistory].period.end = arrivedStatuses[0].period.start;

        dataEndcounter.statusHistory.push({
            period: {
                start: datetime,
                end: datetime
            },
            status: 'triaged'
        })
        dataEndcounter.statusHistory.push({
            period: {
                start: datetime,
                end: datetime
            },
            status: 'finished'
        })
        let datadiagnosis = await getStatus(item.encounter.id_encounter, 'Condition');
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
        console.log(JSON.stringify(dataEndcounter));
        let pushupdateEncounter = await updateEncounter(dataEndcounter, 'Encounter/' + item.encounter.id_encounter);
        console.log(pushupdateEncounter);
        let nik_petugas, nama_petugas;
        let cari_data_triase_igdprimer = await data_triase_igdprimer.findOne({
            where: {
                no_rawat: item.no_rawat,
            },
            include: [
                {
                    model: pegawai,
                    as: 'pegawai',
                    attributes: ['no_ktp', 'nama'],
                }
            ]

        })
        if (cari_data_triase_igdprimer == null) {
            let cari_data_triase_igdsekunder = await data_triase_igdsekunder.findOne({
                where: {
                    no_rawat: item.no_rawat,
                },
                include: [
                    {
                        model: pegawai,
                        as: 'pegawai',
                        attributes: ['no_ktp', 'nama'],
                    }
                ]
            })
            nik_petugas = cari_data_triase_igdsekunder.pegawai.no_ktp;
            nama_petugas = cari_data_triase_igdsekunder.pegawai.nama;
        } else {
            nik_petugas = cari_data_triase_igdprimer.pegawai.no_ktp;
            nama_petugas = cari_data_triase_igdprimer.pegawai.nama;
        }
        let drPractitioner = await getIHS('Practitioner', nik_petugas);

        let dataEX = {
            "resourceType": "Observation",
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "survey",
                            "display": "Survey"
                        }
                    ]
                }
            ],
            "subject": {
                "reference": dataEndcounter.subject.reference,
                "display": dataEndcounter.subject.display
            },
            "encounter": {
                "reference": "Encounter/" + item.encounter.id_encounter
            },
            "effectiveDateTime": datetime,
            "performer": [
                {
                    "reference": "Practitioner/" + drPractitioner.entry[0].resource.id,
                    "display": nama_petugas
                }
            ]
        }
        let cara_masuk = { ...dataEX }
        cara_masuk.code = {
            "coding": [
                {
                    "system": "http://loinc.org",
                    "code": "74286-6",
                    "display": "Transport mode to hospital"
                }
            ]
        }
        if (item.cara_masuk == 'Jalan') {
            cara_masuk.valueCodeableConcept = {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": "282097004",
                        "display": "Ability to walk (observable entity)"
                    }
                ]
            }
        }
        if (item.cara_masuk == 'Brankar') {
            cara_masuk.valueCodeableConcept = {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": "89149003",
                        "display": "Stretcher"
                    }
                ]
            }
        }
        if (item.cara_masuk == 'Kursi Roda') {
            cara_masuk.valueCodeableConcept = {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": "58938008",
                        "display": "Wheelchair"
                    }
                ]
            }
        }
        if (item.cara_masuk == 'Digendong') {
            cara_masuk.valueCodeableConcept = {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": "68369002",
                        "display": "Brought on by"
                    }
                ]
            }
        }
        await postData(cara_masuk, 'Observation');
        let nyeri = { ...dataEX }
        let skala_nyeri = parseInt(item.nyeri);
        nyeri.code = {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "22253000",
                    "display": "Pain"
                }
            ]
        }
        console.log(skala_nyeri)
        if (skala_nyeri != NaN) {
            nyeri.valueBoolean = false;
            await postData(nyeri, 'Observation');
        }
        else {
            nyeri.valueBoolean = true;
            let skala_nyeri = dataEX
            skala_nyeri.code = {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": "1172399009",
                        "display": "Numeric rating scale score"
                    }
                ]
            }
            skala_nyeri.valueInteger = skala_nyeri;
            await postData(skala_nyeri, 'Observation');
        }
        // console.log(JSON.stringify(nyeri));
        let data_penilaian_awal_keperawatan_igd = await penilaian_awal_keperawatan_igd.findOne({
            where: {
                no_rawat: item.no_rawat,
            },
        })
        console.log(data_penilaian_awal_keperawatan_igd)
        if (data_penilaian_awal_keperawatan_igd) {
            if (data_penilaian_awal_keperawatan_igd.rencana != '') {
                let dataCarePlan = {
                    "resourceType": "CarePlan",
                    "title": "Rencana Rawat",
                    "status": "active",
                    "category": [
                        {
                            "coding": [
                                {
                                    "system": "http://terminology.kemkes.go.id",
                                    "code": "TK000068",
                                    "display": "Emergency care plan"
                                }
                            ]
                        }
                    ],
                    "intent": "plan",
                    "description": data_penilaian_awal_keperawatan_igd.rencana,
                    "subject": {
                        "reference": dataEndcounter.subject.reference,
                        "display": dataEndcounter.subject.display
                    },
                    "encounter": {
                        "reference": "Encounter/" + item.encounter.id_encounter
                    },
                    "performer": [
                        {
                            "reference": "Practitioner/" + drPractitioner.entry[0].resource.id,
                            "display": nama_petugas
                        }
                    ],
                    "created": data_penilaian_awal_keperawatan_igd.tanggal,
                    "author": {
                        "reference": "Practitioner/" + drPractitioner.entry[0].resource.id,
                        "display": nama_petugas
                    }
                }
                await postData(dataCarePlan, 'CarePlan');
                console.log(JSON.stringify(dataCarePlan));
            }
        }

    }
}
// pObservation('2025-01-02');
module.exports = { pObservation, ObservationNyeriIGD }; // Export the pObservation
async function deleteElementFromList(key, element) {

    await client.lRem(key, 0, element, (err, reply) => {
        if (err) {
            console.error('Error saat menghapus elemen:', err);
        } else if (reply > 0) {
            console.log(`Berhasil menghapus elemen: ${element}`);
        } else {
            console.log(`Elemen tidak ditemukan: ${element}`);
        }
    });
    console.log('deleteElementFromList')
}
// deleteElementFromList('rsud:Observation:2025-01-02', '2025/01/02/000264')

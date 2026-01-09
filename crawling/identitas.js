require('dotenv').config()
const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const Patient = require("../modelsMongoose/Patient");
const Encounter = require("../modelsMongoose/Encounter");
const { satu_sehat_encounter, satu_sehat_mapping_lokasi_ralan, satu_sehat_mapping_lokasi_ranap, resume_pasien_ranap, bangsal, poliklinik, reg_periksa, kamar_inap, kamar, pasien, kelurahan, kecamatan, kabupaten, propinsi, pegawai, referensi_mobilejkn_bpjs_taskid, diagnosa_pasien, penyakit } = require("../models");
const { Op } = require("sequelize");
const { getPesertabyKatu } = require("../hooks/bpjs");
const { fetchSatusehat } = require("../hooks/satusehat");

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Terhubung ke MongoDB!'))
    .catch(err => console.error('Gagal terhubung ke MongoDB:', err));
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from DB');
});

async function getPractitioner(nik, attributes) {
    let isexist = await Practitioner.findOne({
        'identifier.value': nik
    }, attributes)
    if (isexist) {
        return isexist
    } else {
        let cariIHSnumber = await fetchSatusehat("GET", `/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`)
        console.log(nik)
        if (cariIHSnumber.total > 0) {
            console.log(cariIHSnumber.entry[0].resource.id);
            let dataIHSnumber = await fetchSatusehat("GET", `/Practitioner/${cariIHSnumber.entry[0].resource.id}`)
            let findPegawai = await pegawai.findOne({
                attributes: ['no_ktp', 'nama', 'nik'],
                where: {
                    no_ktp: nik
                },
            })
            dataIHSnumber.identifier.push({
                "system": "https://fhir.kemkes.go.id/id/rsid",
                "value": findPegawai.nik
            })
            await Practitioner.create(dataIHSnumber);
            return dataIHSnumber
        }
        return false
    }
}
async function getPatient(nik, attributes) {
    let isexist = await Patient.findOne({
        'identifier.value': nik
    }, attributes)
    if (isexist) {
        return isexist
    }
    let cariIHSnumber = await fetchSatusehat("GET", `/Patient?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`)
    console.log(nik)
    if (cariIHSnumber.total > 0) {
        let findPatient = await pasien.findOne({
            attributes: ['nm_pasien', 'no_ktp'],
            where: {
                no_ktp: nik
            },
        })
        // console.log(findPatient);
        let dataIHSnumber = cariIHSnumber.entry[0].resource
        // 1. Cari indeks tempat NIK berada
        let nikIndex = dataIHSnumber.identifier.findIndex(id =>
            id.system === "https://fhir.kemkes.go.id/id/nik"
        );
        if (nikIndex !== -1) {
            dataIHSnumber.identifier[nikIndex].value = nik;
        }
        if (!findPatient) {
            await Patient.create(dataIHSnumber);
            return dataIHSnumber
        }

        dataIHSnumber.name[0].text = findPatient.nm_pasien
        await Patient.create(dataIHSnumber);
        return dataIHSnumber

    }
    return false
}
async function postPatient(nik) {
    let dataBPJS = await getPesertabyKatu(nik);
    console.log(JSON.stringify(dataBPJS, null, 2));
    if (dataBPJS.metaData.code !== '200') {
        return
    }
    let dataSosial = await pasien.findOne({
        where: {
            no_ktp: nik
        },
        include: [{
            model: kelurahan,
            as: 'kelurahan',
            required: false,
        },
        {
            model: kecamatan,
            as: 'kecamatan',
            required: false,
        }, {
            model: kabupaten,
            as: 'kabupaten',
        },
        {
            model: propinsi,
            as: 'propinsi',
        },
        ]
    })
    console.log(JSON.stringify(dataSosial, null, 2));
    let dataPatien =
    {
        "resourceType": "Patient",
        "meta": {
            "profile": [
                "https://fhir.kemkes.go.id/r4/StructureDefinition/Patient"
            ]
        },
        "identifier": [
            {
                "use": "official",
                "system": "https://fhir.kemkes.go.id/id/nik",
                "value": nik
            }
        ],
        "active": true,
        "name": [
            {
                "use": "official",
                "text": dataBPJS.response.peserta.nama
            }
        ],
        "gender": dataBPJS.response.peserta.sex === 'P' ? 'female' : 'male',
        "birthDate": dataBPJS.response.peserta.tglLahir,
        "address": [
            {
                "use": "home",
                "line": [
                    dataSosial.dataValues.alamat
                ],
                "city": "BENGKAYANG",
                "country": "ID",
                "extension": [
                    {
                        "url": "https://fhir.kemkes.go.id/r4/StructureDefinition/administrativeCode",
                        "extension": [
                            {
                                "url": "province",
                                "valueCode": String(61)
                            },
                            {
                                "url": "city",
                                "valueCode": String(6107)
                            },
                            {
                                "url": "district",
                                "valueCode": String(610704)
                            },
                            {
                                "url": "village",
                                "valueCode": String(6107041001)
                            }
                        ]
                    }
                ]
            }
        ],
        "multipleBirthInteger": 0,
        "communication": [
            {
                "language": {
                    "coding": [
                        {
                            "system": "urn:ietf:bcp:47",
                            "code": "id-ID",
                            "display": "Indonesian"
                        }
                    ],
                    "text": "Indonesian"
                },
                "preferred": true
            }
        ],
    }
    console.log(JSON.stringify(dataPatien, null, 2));
    let kirim = await fetchSatusehat("POST", `/Patient`, dataPatien)
    console.log(JSON.stringify(kirim, null, 2));
    // return kirim
}
// postPatient('6107046512620002')

async function getEncounter(subject, identifier, attributes) {
    let isexist = await Encounter.findOne({
        'identifier.value': identifier,
        'subject.reference': `Patient/${subject}`,
    }, attributes)
    if (isexist) {
        return isexist
    }
    let cariEncounter = await fetchSatusehat("GET", `/Encounter?subject=${subject}&identifier=${identifier}`)
    if (cariEncounter.total > 0) {
        let dataEncounter = await Encounter.create(cariEncounter.entry[0].resource);
        console.log(dataEncounter)
        return dataEncounter
    }
    return false
}
async function blukEncounter(noRawat) {
    let isexist = await Encounter.find({
        'identifier.value': { $regex: noRawat, $options: 'i' }
    }, 'identifier')
    if (isexist) {
        let dataEncounter = isexist.map(encounter => encounter.identifier.map(identifier => identifier.value).reduce((acc, cur) => acc.concat(cur),));
        return dataEncounter
    }
    return [];
}
// blukEncounter("2026/01/08")


async function postEncouter(date) {
    let dateFormatted = date.split("-").join("/").replace(/-/g, "/");
    console.log(dateFormatted);
    let notIn = await blukEncounter(dateFormatted);
    let dataReg = await reg_periksa.findAll({
        where: {
            tgl_registrasi: date,
            no_rawat: {
                [Op.notIn]: notIn
            },
            stts: {
                [Op.not]: 'batal'
            }
        },
        attributes: ['no_rawat', 'no_rkm_medis', 'kd_dokter', 'kd_poli', 'status_lanjut', 'tgl_registrasi', 'jam_reg'],
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
            required: true,
        }, {
            model: poliklinik,
            as: 'poliklinik',
            attributes: ['kd_poli', 'nm_poli']
        }
        ],
    })
    for (let x of dataReg) {
        let ihsPasen = await getPatient(x.pasien.no_ktp, 'id name')
        if (!ihsPasen) {
            console.log("pasien tidak ada")
            continue
        }

        let dataEncounter = await getEncounter(ihsPasen.id, x.no_rawat)
        if (dataEncounter) {
            console.log(dataEncounter)
            console.log("encounter sudah ada")
            continue
        }
        let ihsPetugas = await getPractitioner(x.pegawai.no_ktp, 'id name')
        let datetime = new Date(x.dataValues.tgl_registrasi + "T" + x.dataValues.jam_reg + ".000Z").toISOString();
        let newEncounter = {
            "resourceType": "Encounter",
            "status": "arrived",
            "class": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                "code": "AMB",
                "display": "ambulatory"
            },
            "subject": {
                "reference": "Patient/" + ihsPasen.id,
                "display": ihsPasen.name[0].text
            },
            "participant": [
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
                        "reference": "Practitioner/" + ihsPetugas.id,
                        "display": ihsPetugas.name[0].text
                    }
                }
            ],
            "period": {
                "start": datetime,
                "end": datetime
            },
            "location": [
                {
                    "location": {
                        "reference": "Location/" + x.dataValues.satu_sehat_mapping_lokasi_ralan.id_lokasi_satusehat,
                        "display": x.dataValues.poliklinik.nm_poli
                    }
                }
            ],
            "statusHistory": [
                {
                    "status": "arrived",
                    "period": {
                        "start": datetime,
                        "end": datetime
                    }
                }
            ],
            "serviceProvider": {
                "reference": "Organization/" + process.env.Organization_id_SATUSEHAT
            },
            "identifier": [
                {
                    "system": "http://sys-ids.kemkes.go.id/encounter/" + process.env.Organization_id_SATUSEHAT,
                    "value": x.dataValues.no_rawat
                }
            ]
        }
        if (x.dataValues.kd_poli == 'IGDK') {
            newEncounter.class.code = "EMER"
            newEncounter.class.display = "emergency"
        }
        if (x.dataValues.status_lanjut == 'Ranap') {
            newEncounter.class.code = "IMP"
            newEncounter.class.display = "inpatient encounter"
        }
        let kirimEncounter = await fetchSatusehat("POST", 'Encounter', newEncounter);
        console.log(newEncounter);
        if (kirimEncounter.error) {
            console.log(kirimEncounter.error);
            continue;
        }
        await Encounter.create(kirimEncounter);
        console.log(ihsPasen.id, x.no_rawat);
    }
    mongoose.disconnect();
}
// postEncouter('2026-01-08')


module.exports = {
    getPractitioner,
    getPatient
}


require('dotenv').config()
const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const Patient = require("../modelsMongoose/Patient");
const Encounter = require("../modelsMongoose/Encounter");
const { satu_sehat_encounter, satu_sehat_mapping_lokasi_ralan, satu_sehat_mapping_lokasi_ranap, resume_pasien_ranap, bangsal, poliklinik, reg_periksa, kamar_inap, kamar, pasien, pegawai, referensi_mobilejkn_bpjs_taskid, diagnosa_pasien, penyakit } = require("../models");
const { Op } = require("sequelize");
const { getlisttask, post } = require("../hooks/bpjs");
const { fetchSatusehat } = require("../hooks/satusehat");
const { where } = require('../modelsMongoose/Condition');

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


async function postEncouter(date) {
    let dataReg = await reg_periksa.findAll({
        where: {
            tgl_registrasi: date,
            status_lanjut: 'Ralan',
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
            // required: false,
        }, {
            model: poliklinik,
            as: 'poliklinik',
            attributes: ['kd_poli', 'nm_poli']
        }
        ],
    })
    for (let x of dataReg) {
        let ihsPasen = await getPatient(x.pasien.no_ktp)

        let dataEncounter = await getEncounter(ihsPasen.id, x.no_rawat)
        if (dataEncounter) {
            console.log(dataEncounter)
            console.log("encounter sudah ada")
            continue
        }
        let ihsPetugas = await getPractitioner(x.pegawai.no_ktp, 'id name')
        console.log(ihsPetugas);
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
        let kirimEncounter = await fetchSatusehat("POST", 'Encounter', newEncounter);
        console.log(newEncounter);
        if (kirimEncounter.error) {
            console.log(kirimEncounter.error);
            continue;
        }
        await Encounter.create(kirimEncounter);
        console.log(ihsPasen.id, x.no_rawat);
    }

}
postEncouter('2026-01-08')


module.exports = {
    getPractitioner,
    getPatient
}


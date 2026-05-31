require('dotenv').config()
const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const Patient = require("../modelsMongoose/Patient");
const Encounter = require("../modelsMongoose/Encounter");
const Composition = require("../modelsMongoose/Composition");
const { catatan_adime_gizi, pemeriksaan_ralan, pemeriksaan_ranap, pegawai } = require("../models");
const { Op } = require("sequelize");
const { getPesertabyKatu } = require("../helpersfetch/bpjs");
const { fetchSatusehat, fetchSatusehatPatch, fetchSatusehatBatch } = require("../helpersfetch/satusehat");
const { MedicalComposition } = require("./helpers/Composition");
const crypto = require('crypto');
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Terhubung ke MongoDB! Composition'))
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

async function kirimInstuksiDiet(date) {
    let dateFormatted = date.split("-").join("/").replace(/-/g, "/");
    console.log("Processing Composition Date/No Rawat:", dateFormatted);
    const encounters = await Encounter.find({
        'identifier.value': { $regex: new RegExp(`^${dateFormatted}`) }
    });
    let mapEncounter = encounters.map(encounter => encounter.id)
    // Batch query: find all observations for all encounters at once
    const allObservations = await Composition.find({
        'encounter.reference': {
            $in: mapEncounter.map(id => `Encounter/${id}`)
        }
    });

    // Create a map of observations by encounter reference for quick lookup
    let mapNoRawatExclude = allObservations.map(obs => obs.encounter.display)
    
    let mapNoRawat = encounters.map(encounter => encounter.identifier[0].value)

    mapNoRawat = mapNoRawat.filter(noRawat => !mapNoRawatExclude.includes(noRawat))
    let findinstuksidet = await catatan_adime_gizi.findAll({
        where: {
            no_rawat: {
                [Op.in]: mapNoRawat
            }
        },
        include: [{
            model: pegawai,
            as: 'pegawai',
            attributes: ['no_ktp', 'nama']
        }],
        attributes: ['no_rawat', 'tanggal', 'intervensi', 'evaluasi', 'instruksi']
    })
    console.log(JSON.stringify(findinstuksidet, null, 2))
    let bundel = {
        "resourceType": "Bundle",
        "type": "transaction",
        "entry": []
    }
    if (findinstuksidet.length === 0) {
        return
    }
    for (let x of findinstuksidet) {
        let dataEncounter = encounters.find(encounter => encounter.identifier[0].value === x.no_rawat)
        let dataPractitioner = await getPractitioner(x.pegawai.no_ktp, 'id name')
        console.log(dataPractitioner)
        const compositionData = new MedicalComposition({
            compositionValue: x.no_rawat,
            patientId: dataEncounter.subject.reference.split("/")[1],
            patientName: dataEncounter.subject.display,
            encounterId: dataEncounter.id,
            encounterDisplay: x.no_rawat,
            practitionerId: dataPractitioner.id,
            practitionerName: x.pegawai.nama,
            date: x.tanggal,
            dietText: `Intervensi: ${x.intervensi}\nEvaluasi: ${x.evaluasi}\nInstruksi: ${x.instruksi}`
        });

        const MedicalCompositionEntry = {
            "fullUrl": "urn:uuid:" + crypto.randomUUID(),
            "resource": compositionData,
            "request": {
                "method": "POST",
                "url": "Composition"
            }
        };
        bundel.entry.push(MedicalCompositionEntry);

    }
    let kirim = await fetchSatusehatBatch("POST", bundel);
    if (kirim.total === 0) {
        console.log(JSON.stringify(kirim.response.issue, null, 2));
        return

    }
    for (let i = 0; i < bundel.entry.length; i++) {
        if (kirim.entry[i] && kirim.entry[i].response) {
            if (kirim.entry[i].response.resourceType === 'Composition') {
                let dataComposition = bundel.entry[i].resource;
                dataComposition.id = kirim.entry[i].response.resourceID;
                let x = await Composition.create(dataComposition)
                console.log(x)

            }
        }
    }
    return

    // console.log(JSON.stringify(findinstuksidet2, null, 2))


}
module.exports = {kirimInstuksiDiet}
// kirimInstuksiDiet('2026-05-02')
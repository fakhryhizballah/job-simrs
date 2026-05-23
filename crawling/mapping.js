require('dotenv').config()
const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const Patient = require("../modelsMongoose/Patient");
const Encounter = require("../modelsMongoose/Encounter");
const KFA = require("../modelsMongoose/Kfa");
const Medication = require("../modelsMongoose/Medication");
const MedicationRequest = require("../modelsMongoose/MedicationRequest");
const Organization = require("../modelsMongoose/Organization");
const Location = require("../modelsMongoose/Location");
const Condition = require("../modelsMongoose/Condition");
const { resep_obat, resep_luar, resep_dokter, databarang, resep_dokter_racikan, satu_sehat_encounter, satu_sehat_mapping_lokasi_ralan, satu_sehat_mapping_lokasi_ranap, resume_pasien_ranap, bangsal, poliklinik, reg_periksa, kamar_inap, kamar, pasien, kelurahan, kecamatan, kabupaten, propinsi, pegawai, referensi_mobilejkn_bpjs_taskid, diagnosa_pasien, penyakit } = require("../models");
const { Op } = require("sequelize");
const { getPesertabyKatu } = require("../helpersfetch/bpjs");
const { fetchSatusehat, fetchKFH } = require("../helpersfetch/satusehat");
const { findBestMatchKFA } = require("../helpers/");
const Org_id = process.env.Organization_id_SATUSEHAT

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Terhubung ke MongoDB!'))
    .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

async function getOrganization() {
    const data = await fetchSatusehat("GET", 'Organization?partof=' + Org_id);
    console.log(JSON.stringify(data, null, 2));

    await Organization.bulkWrite(data.entry.map(x => ({ insertOne: { document: x.resource } })));
    return data;
}
// getOrganization()

async function getLocation() {
    const organizations = await Organization.find();
    for (const org of organizations) {
        const data = await fetchSatusehat("GET", `Location?organization=${org.id}`);
        if (data.entry && data.entry.length > 0) {
            const bulkOps = data.entry.map(item => ({
                replaceOne: {
                    filter: { id: item.resource.id },
                    replacement: item.resource,
                    upsert: true
                }
            }));
            await Location.bulkWrite(bulkOps);
        }
    }
}

// getLocation();

function loca(bangsal, name) {
    let dataLocation = {
        "id": "a7ac8573-c2bd-4b9e-b643-1aaca10073d2",
        "resourceType": "Location",
        "address": {
            "city": "Singkawang",
            "country": "ID",
            "extension": [
                {
                    "extension": [
                        {
                            "url": "province",
                            "valueCode": "61"
                        },
                        {
                            "url": "city",
                            "valueCode": "6172"
                        },
                        {
                            "url": "district",
                            "valueCode": "617202"
                        },
                        {
                            "url": "village",
                            "valueCode": "6172021001"
                        }
                    ],
                    "url": "https://fhir.kemkes.go.id/r4/StructureDefinition/administrativeCode"
                }
            ],
            "line": [
                "Jl. Gn. Merapi No.3, Pasiran, Kec. Singkawang Barat"
            ],
            "postalCode": "617202",
            "use": "work"
        },
        "description": bangsal + " Ruangan " + name,
        "identifier": [
            {
                "system": "http://sys-ids.kemkes.go.id/location/100153543",
                "value": name
            }
        ],
        "managingOrganization": {
            "reference": "Organization/7e1782e9-e18b-4581-8b4b-503ebda5ab2e"
        },
        "mode": "instance",
        "name": name,
        "physicalType": {
            "coding": [
                {
                    "code": "ro",
                    "display": "Room",
                    "system": "http://terminology.hl7.org/CodeSystem/location-physical-type"
                }
            ]
        },
        "position": {
            "altitude": 1,
            "latitude": 108.98074274418371,
            "longitude": 0.8942711596989081
        },
        "status": "active",
        "telecom": [
            {
                "system": "phone",
                "use": "work",
                "value": "081345884009"
            },
            {
                "system": "email",
                "use": "work",
                "value": "rsu.saadah50@gmail.com"
            },
            {
                "system": "url",
                "use": "work",
                "value": "rsusaadah.id"
            }
        ]
    }

    return dataLocation

}



async function mappingbed() {
    let databangsal = await kamar.findAll({
        where: {
            statusdata: 1
        },
        include: [{
            model: bangsal,
            as: 'bangsal'
        }]
    })
    let belum = []
    for (let x of databangsal) {
        let findexisting = await Location.find({
            'identifier.value': x.kd_kamar
        })
        console.log(findexisting)
        if (findexisting.length == 0) {
            console.log(x.bangsal.nm_bangsal)
            let dataLocation = loca(x.bangsal.nm_bangsal, x.kd_kamar)
            console.log(dataLocation)
            let kirmLocation = await fetchSatusehat("POST", '/Location', dataLocation)
            console.log(kirmLocation)
            if (kirmLocation.error) {
                console.log(kirmLocation.error);
                continue;
            }
            await Location.create(kirmLocation);
            belum.push(kirmLocation)
        }
    }
    console.log(belum.length)
    // console.log(JSON.stringify(databangsal[0], null, 2));

}
mappingbed()
require('dotenv').config()
const axios = require('axios');
const qs = require('qs');
const { createClient } = require("redis");
const { convertToISO2, convertToISO3 } = require("../helpers/");
const { getlisttask } = require("../hooks/bpjs");
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_URL_PORT,
    },
});
client.connect();


async function auth() {
    let rand = Math.floor(Math.random() * 10) + 1;
    let authData = await client.json.get('satusehat:auth:' + rand);
    if (!authData) {
        let data = qs.stringify({
            'client_id': `${process.env.CLIENT_ID_SATUSEHAT}`,
            'client_secret': `${process.env.CLIENT_SECRET_SATUSEHAT}`,
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api-satusehat.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };
        try {
            const response = await axios(config);
            console.log(response.data);
            client.json.set('satusehat:auth:' + rand, '$', response.data);
            client.expire('satusehat:auth:' + rand, 1435);
            return response.data;
        }
        catch (error) {
            console.log(error);
        }
    }
    return authData;

}
// auth();

async function getEncounterbyID(id) {
    let authData = await auth();
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${process.env.URL_SATUSEHAT}/Encounter/${id}`,
        headers: {
            'Authorization': `Bearer ${authData.access_token}`
        }
    };
    try {
        const response = await axios(config);
        // console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}

// 6172016609010003
// P01384567978

async function getEncounterbySubject(subject) {
    let authData = await auth();
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${process.env.URL_SATUSEHAT}/Encounter?subject=${subject}`,
        headers: {
            'Authorization': `Bearer ${authData.access_token}`
        }
    };
    try {
        const response = await axios(config);
        // console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}

// getEncounterbySubject('P01384567978');
async function getIHS(status, nik) {
    let authData = await auth();
    let getIHS = await client.json.get('satusehat:getIHS:' + status + ':' + nik);
    if (!getIHS) {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${process.env.URL_SATUSEHAT}/${status}?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`,
            headers: {
                'Authorization': `Bearer ${authData.access_token}`
            }
        };
        try {
            const response = await axios(config);
        // console.log(response.data.entry[0].resource);
            client.json.set('satusehat:getIHS:' + status + ':' + nik, '$', response.data);
            client.expire('satusehat:getIHS:' + status + ':' + nik, 1435);
            return response.data;
        }
        catch (error) {
            console.log(error);
        }
    }
    return getIHS;

}
// getIHS('Patient', '6172016609010003');
// getIHS('Practitioner', '1271211711770003'); // dr

async function postEncouter(data, code) {
    let authData = await auth();
    let dataEX = {
        "resourceType": "Encounter",
        "status": "in-progress",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": code.id,
            "display": code.display
        },
    }
    let history = await getlisttask(data.dataValues.no_rawat);
    history = history.response;
    if (history.length < 3) {
        console.log('Belum Selsai');
        return undefined;
    };
    let history2 = history.findIndex(obj => obj.taskid === 3);
    let history3 = history.findIndex(obj => obj.taskid === 3);
    let history4 = history.findIndex(obj => obj.taskid === 4);
    let history5 = history.findIndex(obj => obj.taskid === 5);
    let waktu2 = convertToISO3(history[history2].wakturs);
    let waktu3 = convertToISO3(history[history3].wakturs);
    let waktu4 = convertToISO3(history[history4].wakturs);
    let waktu5 = convertToISO3(history[history5].wakturs);
    try {
        let pxPatient = await getIHS('Patient', data.reg.pasien.no_ktp);
    if (pxPatient.entry.length == 0) {
        console.log('Patient not found');
        return undefined;
    }
        let subject = { 
        "reference": "Patient/" + pxPatient.entry[0].resource.id,
            "display": data.reg.pasien.nm_pasien
        }
        dataEX.subject = subject;
    }
    catch (error) {
        console.log(error);
        return undefined
    }

    let drPractitioner = await getIHS('Practitioner', data.reg.pegawai.no_ktp);
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
                "display": drPractitioner.entry[0].resource.name[0].text
            }
        }
    ]
    dataEX.participant = participant;

    let period = {
        "start": waktu3,
        "end": waktu4
    }
    dataEX.period = period;
    let statusHistory = [
        {
            "status": "arrived",
            "period": {
                "start": waktu2,
                "end": waktu3
            }
        },
        {
            "status": "in-progress",
            "period": {
                "start": waktu3,
                "end": waktu4
            }
        },
    ]
    dataEX.statusHistory = statusHistory;
    let location = [
        {
            "location": {
                "reference": "Location/" + data.reg.satu_sehat_mapping_lokasi_ralan.id_lokasi_satusehat,
                "display": data.reg.poliklinik.nm_poli
            }
        }
    ]
    dataEX.location = location;

    let serviceProvider = {
        "reference": "Organization/" + process.env.Organization_id_SATUSEHAT,
    }
    dataEX.serviceProvider = serviceProvider;
    let identifier = [
        {
            "system": "http://sys-ids.kemkes.go.id/encounter/" + process.env.Organization_id_SATUSEHAT,
            "value": data.no_rawat
        }
    ]
    dataEX.identifier = identifier;
    // console.log(dataEX);
    dataEX = JSON.stringify(dataEX);
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.URL_SATUSEHAT}/Encounter`,
        headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
        },
        data: dataEX
    };
    try {
        const response = await axios(config);
        // console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.log(error);
        if (error.response && error.response.status === 400) {
            console.log("Bad Request: ", error.response.data);
            return undefined;
        } else {
            console.log(error);
        }
    }
}
async function updateEncounter(data, patch) {
    let authData = await auth();
    let config = {
        method: 'put',
        url: `${process.env.URL_SATUSEHAT}/${patch}`,
        maxBodyLength: Infinity,
        headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
        },
        data: data
    };
    try {
        const response = await axios(config);
        // console.log(response);
        return response;
    }
    catch (error) {
        // console.log(error);
        if (error.response && error.response.status === 400) {
            console.log("Bad Request: ", error.response.data);
            console.log(error.response.data.issue[0]);
        } else {
            console.log(error);
        }
        return undefined;
    }

}
async function postEncouter2(data, code) {
    let start_period = data.kamar_inap[[data.kamar_inap.length - 1]]
    if (start_period.stts_pulang === '-' && start_period.stts_pulang === 'Pindah Kamar') {
        return undefined
    }
    let authData = await auth();
    let dataEX = {
        "resourceType": "Encounter",
        "status": "in-progress",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": code.id,
            "display": code.display
        },
    }
    try {
        let pxPatient = await getIHS('Patient', data.pasien.no_ktp);
        // console.log(data.reg.pasien.no_ktp);
        if (pxPatient.entry.length == 0) {
            console.log('Patient not found');
            return;
        }
        let subject = {
            "reference": "Patient/" + pxPatient.entry[0].resource.id,
            "display": data.pasien.nm_pasien
        }
        dataEX.subject = subject;
    }
    catch (error) {
        console.log(error);
        return undefined
    }

    let drPractitioner = await getIHS('Practitioner', data.pegawai.no_ktp);
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
                "display": data.pegawai.nama
            }
        }
    ]
    dataEX.participant = participant;
    let period = {
        "start": convertToISO2(data.kamar_inap[0].tgl_masuk + ' ' + data.kamar_inap[0].jam_masuk),
        "end": convertToISO2(data.kamar_inap[data.kamar_inap.length - 1].tgl_keluar + ' ' + data.kamar_inap[data.kamar_inap.length - 1].jam_keluar)
        }
    dataEX.period = period;

    let statusHistory = [
        {
            "status": "arrived",
            "period": {
                "start": convertToISO2(data.tgl_registrasi + ' ' + data.jam_reg), //"2022-06-14T07:00:00+07:00"
                "end": convertToISO2(data.kamar_inap[0].tgl_masuk + ' ' + data.kamar_inap[0].jam_masuk)
            }
        },
        {
            "status": "in-progress",
            "period": {
                "start": convertToISO2(data.kamar_inap[0].tgl_masuk + ' ' + data.kamar_inap[0].jam_masuk),
                "end": convertToISO2(data.kamar_inap[data.kamar_inap.length - 1].tgl_keluar + ' ' + data.kamar_inap[data.kamar_inap.length - 1].jam_keluar)
            }
        },
        // {
        //     "status": "finished",
        //     "period": {
        //         "start": convertToISO2(data.kamar_inap[data.kamar_inap.length - 1].tgl_keluar + ' ' + data.kamar_inap[data.kamar_inap.length - 1].jam_keluar),
        //         "end": convertToISO2(data.kamar_inap[data.kamar_inap.length - 1].tgl_keluar + ' ' + data.kamar_inap[data.kamar_inap.length - 1].jam_keluar)
        //     }
        // }
    ]
    dataEX.statusHistory = statusHistory;
    let location = [
        {
            "location": {
                "reference": "Location/" + data.satu_sehat_mapping_lokasi_ralan.id_lokasi_satusehat,
                "display": data.poliklinik.nm_poli
            }
        }
    ]
    dataEX.location = location;
    for (let i of data.kamar_inap) {
        let locat = {
            "location": {
                "reference": "Location/" + i.mapping_lokasi_ranap.id_lokasi_satusehat,
                "display": i.kd_kamar + ' - ' + i.kode_kamar.bangsal.nm_bangsal
            },
            period: {
                "start": convertToISO2(i.tgl_masuk + ' ' + i.jam_masuk),
                "end": convertToISO2(i.tgl_keluar + ' ' + i.jam_keluar)
            }
        }
        dataEX.location.push(locat);
    }
    let serviceProvider = {
        "reference": "Organization/" + process.env.Organization_id_SATUSEHAT,
    }
    dataEX.serviceProvider = serviceProvider;
    let identifier = [
        {
            "system": "http://sys-ids.kemkes.go.id/encounter/" + process.env.Organization_id_SATUSEHAT,
            "value": data.no_rawat
        }
    ]
    dataEX.identifier = identifier;
    console.log((JSON.stringify(dataEX, null, 2)));
    dataEX = JSON.stringify(dataEX);
    // return undefined
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.URL_SATUSEHAT}/Encounter`,
        headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
        },
        data: dataEX
    };
    try {
        const response = await axios(config);
        // console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.log(error);
        if (error.response && error.response.status === 400) {
            console.log("Bad Request: ", error.response.data);
            return undefined;
        } else {
            console.log(error);
        }
    }
}

async function postData(data, patch) {
    let authData = await auth();
    let config = {
        method: 'post',
        url: `${process.env.URL_SATUSEHAT}/${patch}`,
        maxBodyLength: Infinity,
        headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
        },
        data: data
    };
    try {
        const response = await axios(config);
        // console.log(response);
        return response;
    }
    catch (error) {
        // console.log(error);
        if (error.response && error.response.status === 400) {
            console.log("Bad Request: ", error.response.data);
            console.log(error.response.data.issue[0]);
        } else {
            console.log(error);
        }
        return undefined;
    }
}
async function postObservation(code, subject, performer, encounter, effectiveDateTime, issued, valueQuantity) {
    let authData = await auth();
    let data = {
        "resourceType": "Observation",
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "vital-signs",
                        "display": "Vital Signs"
                    }
                ]
            }
        ]
    }
    data.code = code;
    data.subject = subject;
    data.performer = performer;
    data.encounter = encounter;
    data.effectiveDateTime = effectiveDateTime;
    data.issued = issued;
    data.valueQuantity = valueQuantity;
    let dataEX = JSON.stringify(data);
    console.log(dataEX);
    let config = {
        method: 'post',
        url: `${process.env.URL_SATUSEHAT}/Observation`,
        maxBodyLength: Infinity,
        headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
        },
        data: dataEX
    };
    try {
        const response = await axios(config);
        console.log(response);
        return response;
    }
    catch (error) {
        console.log(error);
        if (error.response && error.response.status === 400) {
            console.log("Bad Request: ", error.response.data);
            return undefined;
        } else {
            console.log(error);
        }
    }
}
async function postObservationExam(subject, performer, encounter, effectiveDateTime, valueCodeableConcept) {
    let authData = await auth();
    let data = {
        "resourceType": "Observation",
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "exam",
                        "display": "Exam"
                    }
                ]
            }
        ],
        "code": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "1104441000000107",
                    "display": "ACVPU (Alert Confusion Voice Pain Unresponsive) scale score"
                }
            ]
        }
    }
    data.subject = subject;
    data.performer = performer;
    data.encounter = encounter;
    data.effectiveDateTime = effectiveDateTime;
    data.valueCodeableConcept = valueCodeableConcept;
    let dataEX = JSON.stringify(data);
    console.log(dataEX);
    let config = {
        method: 'post',
        url: `${process.env.URL_SATUSEHAT}/Observation`,
        maxBodyLength: Infinity,
        headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
        },
        data: dataEX
    };
    try {
        const response = await axios(config);
        console.log(response);
        return response;
    }
    catch (error) {
        console.log(error);
        if (error.response && error.response.status === 400) {
            console.log("Bad Request: ", error.response.data);
            return undefined;
        } else {
            console.log(error);
        }
    }
}
async function postObservationTensi(code, subject, performer, encounter, effectiveDateTime, issued, component) {
    let authData = await auth();
    let data = {
        "resourceType": "Observation",
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "vital-signs",
                        "display": "Vital Signs"
                    }
                ]
            }
        ]
    }
    data.code = code;
    data.subject = subject;
    data.performer = performer;
    data.encounter = encounter;
    data.effectiveDateTime = effectiveDateTime;
    data.issued = issued;
    data.component = component;
    let dataEX = JSON.stringify(data);
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.URL_SATUSEHAT}/Observation`,
        headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
        },
        data: dataEX
    };
    try {
        const response = await axios(config);
        // console.log(response);
        return response.data;
    }
    catch (error) {
        console.log(error);
        if (error.response && error.response.status === 400) {
            console.log("Bad Request: ", error.response.data);
            return undefined;
        } else {
            console.log(error);
        }
    }
}
async function getEncounter(id) {
    let authData = await auth();
    let config = {
        method: 'get',
        url: `${process.env.URL_SATUSEHAT}/Encounter/${id}`,
        headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await axios(config);
        // console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.log(error);
        if (error.response && error.response.status === 400) {
            console.log("Bad Request: ", error.response.data);
            return undefined;
        } else {
            console.log(error);
        }
    }
}


async function getStatus(id, patch) {
    let authData = await auth();
    let config = {
        method: 'get',
        url: `${process.env.URL_SATUSEHAT}/${patch}?encounter=${id}`,
        headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await axios(config);
        // console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.log(error);
        if (error.response && error.response.status === 400) {
            console.log("Bad Request: ", error.response.data);
            return undefined;
        } else {
            console.log(error);
        }
    }

}


module.exports = {
    getEncounterbyID,
    getEncounterbySubject,
    getIHS,
    postEncouter,
    updateEncounter,
    postEncouter2,
    postData,
    postObservation,
    postObservationExam,
    postObservationTensi,
    getEncounter,
    getStatus
}
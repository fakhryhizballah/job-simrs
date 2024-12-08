require('dotenv').config()
const axios = require('axios');
const qs = require('qs');
const { createClient } = require("redis");
const { convertToISO2 } = require("../helpers/");
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_URL_PORT,
    },
});
client.connect();


async function auth() {
    let authData = await client.json.get('satusehat:auth');
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
            client.json.set('satusehat:auth', '$', response.data);
            client.expire('satusehat:auth', 1435);
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
        console.log(response.data);
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
        console.log(response.data);
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

async function postEncouter(data, TaksID3, TaksID5, code) {
    let authData = await auth();
    let dataEX = {
        "resourceType": "Encounter",
        "status": "arrived",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": code.id,
            "display": code.display
        },
    }
    try {
    let pxPatient = await getIHS('Patient', data.reg.pasien.no_ktp);
        // console.log(data.reg.pasien.no_ktp);
    if (pxPatient.entry.length == 0) {
        console.log('Patient not found');
        return;
    }
        let subject = { 
        "reference": "Patient/" + pxPatient.entry[0].resource.id,
        "display": pxPatient.entry[0].resource.name[0].text
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
    // Buat objek Date dari string input
    let start = new Date(TaksID3);
    // Tambahkan 7 jam ke waktu
    let startTime = new Date(start.getTime() + 7 * 60 * 60 * 1000);
    // Format hasil ke ISO 8601 dengan offset +07:00
    let formattedStartTime = startTime.toISOString().replace('Z', '+07:00');
    let period = {
        "start": formattedStartTime, //"2022-06-14T07:00:00+07:00"
    }
    dataEX.period = period;
    console.log(TaksID3);
    let statusHistory = [
        {
            "status": "arrived",
            "period": {
                "start": formattedStartTime, //"2022-06-14T07:00:00+07:00"
            }
        }
    ]
    dataEX.statusHistory = statusHistory;

    if (TaksID5 != null) {
        let end = new Date(TaksID5);
        let endTime = new Date(end.getTime() + 7 * 60 * 60 * 1000);
        let formattedEndTime = endTime.toISOString().replace('Z', '+07:00');
        dataEX.period.end = formattedEndTime
        dataEX.statusHistory[0].period.end = formattedEndTime
    }
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
    console.log(dataEX);
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

async function postCondition(diagnosis, px, encounterId) {
    let Condition = {
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
            "coding": []
        },
        "subject": {
            "reference": "Patient/P02278539641",
            "display": "VINCENTIA EUDORA ANJANI"
        },
        "encounter": {
            "reference": "Encounter/37f6b42a-cb67-4fba-a792-df1a561f67bd",
            "display": "Diagnosa VINCENTIA EUDORA ANJANI selama kunjungan/dirawat dari tanggal 2023-10-02 09:06:14 sampai 2023-10-02 12:11:15"
        }
    }
    let coding = {
        "system": "http://hl7.org/fhir/sid/icd-10",
        "code": diagnosis.kd_penyakit,
        "display": diagnosis.penyakit.nm_penyakit
    }
    // let subject = {
    //     "reference": "Patient/" + px
    //     "display": 
    // }
    Condition.subject = subject;
    let encounter = {
        "reference": "Encounter/" + encounterId,
        "display": "Diagnosa "
    }
}


module.exports = {
    getEncounterbyID,
    getEncounterbySubject,
    getIHS,
    postEncouter,
    postEncouter2,
    postCondition
}
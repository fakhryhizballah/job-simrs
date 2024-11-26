require('dotenv').config()
const axios = require('axios');
const qs = require('qs');
const { createClient } = require("redis");
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
            // console.log(response.data);
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
    console.log(data);
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
    return undefined
    // let config = {
    //     method: 'post',
    //     maxBodyLength: Infinity,
    //     url: `${process.env.URL_SATUSEHAT}/Encounter`,
    //     headers: {
    //         'Authorization': `Bearer ${authData.access_token}`,
    //         'Content-Type': 'application/json'
    //     },
    //     data: dataEX
    // };
    // try {
    //     const response = await axios(config);
    //     // console.log(response.data);
    //     return response.data;
    // }
    // catch (error) {
    //     console.log(error);
    //     if (error.response && error.response.status === 400) {
    //         console.log("Bad Request: ", error.response.data);
    //         return undefined;
    //     } else {
    //         console.log(error);
    //     }
    // }
}

module.exports = {
    getEncounterbyID,
    getEncounterbySubject,
    getIHS,
    postEncouter
}
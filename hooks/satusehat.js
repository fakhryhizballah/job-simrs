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
        console.log(response.data.entry[0].resource);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}
// getIHS('Patient', '6172016609010003');
// getIHS('Practitioner', '1271211711770003'); // dr

async function postEncouter() {
}

const axios = require('axios');
require('dotenv').config()
async function refKamar() {
    console.log(process.env.URL_SIRS);
    let d = new Date();
    let timestamp = Math.floor(d.getTime() / 1000);
    let config = {
        method: 'get',
        url: process.env.URL_SIRS + '/Referensi/tempat_tidur',
        headers: {
            'X-rs-id': process.env.X_rsid,
            'X-Timestamp': timestamp,
            'X-Pass': process.env.X_Pass,
        }
    };
    try {
        const response = await axios(config);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}
async function getKamar() {
    console.log(process.env.URL_SIRS);
    let d = new Date();
    let timestamp = Math.floor(d.getTime() / 1000);
    let config = {
        method: 'get',
        url: process.env.URL_SIRS + '/Fasyankes',
        headers: {
            'X-rs-id': process.env.X_rsid,
            'X-Timestamp': timestamp,
            'X-Pass': process.env.X_Pass,
        }
    };
    try {
        const response = await axios(config);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}
async function updateKamar(e) {
    let data = JSON.stringify(e);
    console.log(data);
    let d = new Date();
    let timestamp = Math.floor(d.getTime() / 1000);
    let config = {
        method: 'put',
        url: process.env.URL_SIRS + '/Fasyankes',
        headers: {
            'Content-Type': 'application/json',
            'X-rs-id': process.env.X_rsid,
            'X-Timestamp': timestamp,
            'X-Pass': process.env.X_Pass,
        },
        data: data
    };
    try {
        const response = await axios(config);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = { refKamar, getKamar, updateKamar };
const axios = require('axios');
async function addAntrean(data) {
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.URL_BPJS+'/api/bpjs/antrean/add',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
    try {
      const response = await axios(config);
        return response.data;
    }
    catch (error) {
      console.log(error);
    }
}
async function post(data, patch) {
  data = JSON.stringify(data);
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.URL_BPJS+patch,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
    try {
      const response = await axios(config);
        return response.data;
    }
    catch (error) {
      console.log(error);
    }
}

async function jddokter(tanggal, poli) {
    let config = {
        method: 'get',
        url: `${process.env.URL_BPJS}/api/bpjs/antrean/jadwaldokter?tanggal=${tanggal}&kd_poli_BPJS=${poli}`,
        headers: { 
            'Content-Type': 'application/json'
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
async function getPesertabyKatu(noka) {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  let tglSEP = `${year}-${month}-${day}`;
  let config = {
    method: 'get',
    url: `${process.env.URL_BPJS}/api/bpjs/peserta/nokartu?nik=${noka}&tglSEP=${tglSEP}`,
    headers: { 
        'Content-Type': 'application/json'
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

module.exports = {
    addAntrean,
    jddokter,
    getPesertabyKatu,
    post
}
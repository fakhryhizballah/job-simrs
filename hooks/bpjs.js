const axios = require('axios');
const { referensi_mobilejkn_bpjs_taskid } = require("../models");
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
async function updatewaktu(data) {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.URL_BPJS + '/api/bpjs/antrean/updatewaktu/',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };

  try {
    const response = await axios(config);
    if (response.data.metadata.code == 208 || response.data.metadata.code == 200) {
      let isexist = await referensi_mobilejkn_bpjs_taskid.findOne({
        where: {
          no_rawat: data.kodebooking,
          taskid: data.taskid
        }
      });
      if (!isexist) {
        referensi_mobilejkn_bpjs_taskid.create({
          no_rawat: data.kodebooking,
          taskid: data.taskid,
          waktu: data.waktu
        }).then(() => {
          console.log('berhasil');
        }).error(() => {
          console.log('gagal');
        })
      }
    }
    return response.data;
  }
  catch (error) {
    console.log(error);
  }
}
async function updatewaktuJKN(data) {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.URL_BPJS + '/api/bpjs/antrean/updatewaktu/',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
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
async function batalAntrean(data) {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.URL_BPJS + '/api/bpjs/antrean/batal',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };

  try {
    const response = await axios(config);
    if (response.data.metadata.code == 201 || response.data.metadata.code == 200) {
      let isexist = await referensi_mobilejkn_bpjs_taskid.findOne({
        where: {
          no_rawat: data.kodebooking,
          taskid: '99'
        }
      });
      if (!isexist) {
        let date = new Date();
        let timestampInMillis = date.getTime();
        await referensi_mobilejkn_bpjs_taskid.create({
          no_rawat: data.kodebooking,
          taskid: '99',
          Waktu: timestampInMillis
        });
      }
    }
    return response.data;
  }
  catch (error) {
    // console.log(error);
  }

}
async function getAntrian(date) {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: process.env.URL_BPJS + '/api/bpjs/antrean/pendaftaran?tanggal=' + date,
    headers: {},
  };
  try {
    const response = await axios(config);
    return response.data;
  }
  catch (error) {
    console.log(error);
  }

}

async function getlisttask(kd_boing) {
  let data = JSON.stringify({
    "kodebooking": kd_boing
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.URL_BPJS + '/api/bpjs/antrean/getlisttask',
    headers: {
      'Content-Type': 'application/json'
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
async function getRujukan(noka) {
  let config = {
    method: 'get',
    url: `${process.env.URL_BPJS}/api/bpjs/peserta/rujukan?noKartu=${noka}`,
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
async function getJumlahsep(jenisRujukan, noRujukan) {
  let config = {
    method: 'get',
    url: `${process.env.URL_BPJS}/api/bpjs/peserta/jumlahsep?jenisRujukan=${jenisRujukan}&noRujukan=${noRujukan}`,
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
async function getlistrencanakontrol(Bulan, Tahun, Nokartu) {
  let config = {
    method: 'get',
    url: `${process.env.URL_BPJS}/api/bpjs/peserta/listrencanakontrol?Bulan=${Bulan}&Tahun=${Tahun}&Nokartu=${Nokartu}&filter=2`,
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
async function updateKamar(dataKamar) {
  let data = JSON.stringify(dataKamar);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.URL_BPJS + '/api/bpjs/updatekamar',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };
  console.log(config)
  try {
    const response = await axios(config);
    return response.data;
  }
  catch (error) {
    console.log(error);
  }
}
async function getfinger(tgl, nokartu) {
  let config = {
    method: 'get',
    url: `${process.env.URL_BPJS}/api/bpjs/peserta/getfinger?Tglpelayanan=${tgl}&Nokartu=${nokartu}`,
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
  updatewaktu,
  updatewaktuJKN,
  batalAntrean,
  getAntrian,
  getlisttask,
    jddokter,
    getPesertabyKatu,
  getRujukan,
  getJumlahsep,
  getlistrencanakontrol,
  updateKamar,
  getfinger,
    post
}
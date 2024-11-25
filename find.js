const axios = require('axios');
const fs = require('fs');

async function findRM(SEP) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'http://10.8.0.4:9080/api/inacbg/get_claim_data?method=get_claim_data&noSEP=' + SEP,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await axios(config);
        console.log(response.data.response.data.nomor_rm);
        return response.data.response.data.nomor_rm;
    }
    catch (error) {
        console.log(error);
    }
}

async function tambah() {
    const fileContent = fs.readFileSync('COVID19.json', 'utf-8');
    let dataObj = JSON.parse(fileContent);
    console.log(dataObj);
    for (let x of dataObj) {
        // console.log(x.No_Pengajuan);
        let rm = await findRM(x.No_Pengajuan);
        console.log(rm);
        x.no_rm = rm;
        //
    } fs.writeFileSync('COVID19.json', JSON.stringify(dataObj));

}

// findRM('6172011ICC22030002');
tambah()
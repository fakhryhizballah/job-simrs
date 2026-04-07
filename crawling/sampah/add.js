async function postPatient(nik) {
    let dataBPJS = await getPesertabyKatu(nik);
    console.log(JSON.stringify(dataBPJS, null, 2));
    if (dataBPJS.metaData.code !== '200') {
        return
    }
    let dataSosial = await pasien.findOne({
        where: {
            no_ktp: nik
        },
        include: [{
            model: kelurahan,
            as: 'kelurahan',
            required: false,
        },
        {
            model: kecamatan,
            as: 'kecamatan',
            required: false,
        }, {
            model: kabupaten,
            as: 'kabupaten',
        },
        {
            model: propinsi,
            as: 'propinsi',
        },
        ]
    })
    console.log(JSON.stringify(dataSosial, null, 2));
    let dataPatien =
    {
        "resourceType": "Patient",
        "meta": {
            "profile": [
                "https://fhir.kemkes.go.id/r4/StructureDefinition/Patient"
            ]
        },
        "identifier": [
            {
                "use": "official",
                "system": "https://fhir.kemkes.go.id/id/nik",
                "value": nik
            }
        ],
        "active": true,
        "name": [
            {
                "use": "official",
                "text": dataBPJS.response.peserta.nama
            }
        ],
        "gender": dataBPJS.response.peserta.sex === 'P' ? 'female' : 'male',
        "birthDate": dataBPJS.response.peserta.tglLahir,
        "address": [
            {
                "use": "home",
                "line": [
                    dataSosial.dataValues.alamat
                ],
                "city": "BENGKAYANG",
                "country": "ID",
                "extension": [
                    {
                        "url": "https://fhir.kemkes.go.id/r4/StructureDefinition/administrativeCode",
                        "extension": [
                            {
                                "url": "province",
                                "valueCode": String(61)
                            },
                            {
                                "url": "city",
                                "valueCode": String(6107)
                            },
                            {
                                "url": "district",
                                "valueCode": String(610704)
                            },
                            {
                                "url": "village",
                                "valueCode": String(6107041001)
                            }
                        ]
                    }
                ]
            }
        ],
        "multipleBirthInteger": 0,
        "communication": [
            {
                "language": {
                    "coding": [
                        {
                            "system": "urn:ietf:bcp:47",
                            "code": "id-ID",
                            "display": "Indonesian"
                        }
                    ],
                    "text": "Indonesian"
                },
                "preferred": true
            }
        ],
    }
    console.log(JSON.stringify(dataPatien, null, 2));
    let kirim = await fetchSatusehat("POST", `/Patient`, dataPatien)
    console.log(JSON.stringify(kirim, null, 2));
    // return kirim
}
// postPatient('6107046512620002')
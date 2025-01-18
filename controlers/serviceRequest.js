const { satu_sehat_encounter, permintaan_pemeriksaan_radiologi, permintaan_radiologi, satu_sehat_mapping_radiologi, jns_perawatan_radiologi, satu_sehat_servicerequest_radiologi, pegawai, } = require("../models");
const { getIHS, getEncounter, getStatus, postData } = require("../hooks/satusehat");
const { convertToISO2 } = require("../helpers");
const { Op } = require("sequelize");
const { createClient } = require("redis");
require('dotenv').config()
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_URL_PORT,
    },
});
client.connect();
pServiceRequestRadiologi('2025-01-02');
async function pServiceRequestRadiologi(date) {
    let no_rawat = date.split("-").join("/");


    let data_permintaan_radiologi = await permintaan_radiologi.findAll({
        where: {
            no_rawat: { [Op.startsWith]: no_rawat },
            '$encounter.id_encounter$': { [Op.ne]: null },
        },
        include: [
            {
                model: pegawai,
                as: 'pegawai',
                attributes: ['nama', 'no_ktp']
            },
            {
                model: satu_sehat_encounter,
                as: 'encounter',
                required: false,
            },
            {
                model: permintaan_pemeriksaan_radiologi,
                attributes: ['kd_jenis_prw'],
                include: [{
                    model: satu_sehat_mapping_radiologi,
                    required: true,
                },
                {
                    model: jns_perawatan_radiologi
                }]
            }
        ]
    })
    let sudah = await client.lRange('rsud:servicerequest:rad:' + date, 0, -1,)

    let filtered = data_permintaan_radiologi.filter(item => !sudah.includes(item.noorder));
    let akanDikirim = filtered.length;
    console.log(akanDikirim)
    let terkirim = 0;
    for (let i of filtered) {

        console.log(i.encounter.dataValues.id_encounter)
        console.log(i.no_rawat)
        console.log(i)
        if (i.permintaan_pemeriksaan_radiologi == null) {
            continue;
        }

        let Practitioner = await getIHS('Practitioner', i.pegawai.dataValues.no_ktp);
        let dataEncounter = await getEncounter(i.encounter.dataValues.id_encounter);
        let subject = {
            "reference": dataEncounter.subject.reference,
        }
        let requester = {
            "reference": "Practitioner/" + Practitioner.entry[0].resource.id,
        }
        let encounter = {
            "reference": "Encounter/" + i.encounter.dataValues.id_encounter,
        }
        let code =
        {
            "coding": [
                {
                    "system": i.permintaan_pemeriksaan_radiologi.satu_sehat_mapping_radiologi.system,
                    "code": i.permintaan_pemeriksaan_radiologi.satu_sehat_mapping_radiologi.code,
                    "display": i.permintaan_pemeriksaan_radiologi.satu_sehat_mapping_radiologi.display
                }
            ],
            "text": i.permintaan_pemeriksaan_radiologi.jns_perawatan_radiologi.nm_perawatan
        }

        console.log(code[0])
        let dateTime = convertToISO2(i.tgl_permintaan + ' ' + i.jam_permintaan)
        let resource = {
            "resourceType": "ServiceRequest",
            "identifier": [
                {
                    "system": "http://sys-ids.kemkes.go.id/servicerequest/" + process.env.Organization_id_SATUSEHAT,
                    "value": i.no_rawat
                }
            ],
            "status": "active",
            "intent": "order",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "363679005",
                            "display": "Imaging"
                        }
                    ]
                }
            ],
            "code": code,
            "locationReference": [
                {
                    "reference": "Location/b7aed9e8-587e-4b4f-a8dc-3d59e57df011",
                    "display": "INSTALASI RADIOLOGI"
                }
            ],
            "performer": [
                {
                    "reference": "Organization/" + process.env.Organization_id_SATUSEHAT,
                    "display": "Ruang Radiologi"
                }
            ],
            "reasonCode": [
                {
                    "text": "Diagnosa_klinis : " + i.diagnosa_klinis
                }
            ],
            "requester": requester,
            "subject": subject,
            "encounter": encounter,
            "authoredOn": dateTime
        }
        try {
            let result = await postData(resource, 'ServiceRequest');
            console.log(result);
            terkirim++;
            await satu_sehat_servicerequest_radiologi.create({
                noorder: i.noorder,
                kd_jenis_prw: i.permintaan_pemeriksaan_radiologi.jns_perawatan_radiologi.nm_perawatan,
                id_servicerequest: result.data.id,
            })
        } catch (error) {
            console.log(error)
        }
        await client.rPush('rsud:servicerequest:rad:' + date, i.noorder);
        await client.expire('rsud:servicerequest:rad:' + date, 60 * 60 * 12);

    }

    // console.log('akan dikirim = ' + akanDikirim)
    console.log('dikirm = ' + terkirim)

}

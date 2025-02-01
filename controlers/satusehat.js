const { postEncouterRalan, updateEncouterRalan } = require('../controlers/encounter.js');
const pObservation = require('../controlers/observation.js');
const pServiceRequestRadiologi = require('../controlers/serviceRequest.js');
const { pCondition, pProcedure } = require('../controlers/condition.js');
const { pClinicalImpression } = require('../controlers/clinicalImpression.js');

async function kirm(date) {
    await postEncouterRalan(date);
    await pObservation(date);
    await pCondition(date);
    await pProcedure(date);
    await pServiceRequestRadiologi(date);
    await pClinicalImpression(date);
    await updateEncouterRalan(date);
}

kirm('2025-01-07');
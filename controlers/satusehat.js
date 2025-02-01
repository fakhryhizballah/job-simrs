const { postEncouterRalan, updateEncouterRalan } = require('../controlers/encounter.js');
const pObservation = require('../controlers/observation.js');
const pServiceRequestRadiologi = require('../controlers/serviceRequest.js');
const { pCondition, pProcedure } = require('../controlers/condition.js');
const { pClinicalImpression } = require('../controlers/clinicalImpression.js');

async function kirm(date) {
    // pObservation(date);
}

kirm('2025-01-07');
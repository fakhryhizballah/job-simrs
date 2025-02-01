const { postEncouterRalan, postEncouterIGD, updateEncouterRalan } = require('../controlers/encounter.js');
const { pObservation, ObservationNyeriIGD } = require('../controlers/observation.js');
const { pServiceRequestRadiologi } = require('../controlers/serviceRequest.js');
const { pCondition, pProcedure } = require('../controlers/condition.js');
const { pClinicalImpression } = require('../controlers/clinicalImpression.js');

async function kirm(date) {
    await postEncouterRalan(date);
    await postEncouterIGD(date);
    await pObservation(date);
    await pCondition(date);
    await pProcedure(date);
    await pServiceRequestRadiologi(date);
    await pClinicalImpression(date);
    await ObservationNyeriIGD(date);
    await updateEncouterRalan(date);
    console.log('done');
}
//  for (let i = 1; i <= 30; i++) {
//     // await kirimIGD(`2025-10-${i < 10 ? '0' + i : i}`);
//     kirm(`2025-01-${i < 10 ? '0' + i : i}`);
//     new Promise(resolve => setTimeout(resolve, 3000));
// }
(async () => {
    for await (let i of Array.from({ length: 30 }, (_, i) => i + 1)) {
        await kirm(`2024-06-${i < 10 ? '0' + i : i}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
})();
// kirm('2025-01-08');

async function kirimIGD(date) {
    await postEncouterIGD(date);
    await pObservation(date);
    await pCondition(date);
    await pProcedure(date);
    await pServiceRequestRadiologi(date);
    await pClinicalImpression(date);
    await ObservationNyeriIGD(date);
    console.log('done');
}
// kirimIGD('2024-12-02');
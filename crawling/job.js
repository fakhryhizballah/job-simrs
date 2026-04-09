const { postEncouter } = require("./identitas.js");
async function kirm(date) {
    await postEncouter(date)
    console.log('done');
}

(async () => {
    for (let i = 17; i <= 31; i++) {
        await kirm(`2023-10-${i < 10 ? '0' + i : i}`);
        console.log(`2023-10-${i < 10 ? '0' + i : i}`);
        console.log('selesai');
        // await new Promise(resolve => setTimeout(resolve, 3000));
    }
})();
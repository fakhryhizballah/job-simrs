function convmils(datetime, delay) {
    const dateString = datetime;
    let date = new Date(dateString);
    date.setMinutes(date.getMinutes() + delay);
    const estimasidilayani = date.getTime();
    return estimasidilayani;
}
function milsPlus(mils, delay) {
    let date = new Date(mils);
    date.setMinutes(date.getMinutes() + delay);
    const estimasidilayani = date.getTime();
    return estimasidilayani;
}

function getRandomTimeInMillis(min, max) {
    let randomFraction = Math.random();
    let minTime = min * 60 * 1000; // 1 menit dalam milidetik
    let maxTime = max * 60 * 1000; // 5 menit dalam milidetik
    let randomTime = minTime + Math.floor(randomFraction * (maxTime - minTime + 1));

    return randomTime;
}
function setStingTodate(y) {
    let [tanggal, waktu, zonaWaktu] = y.split(' ');
    let [hari, bulan, tahun] = tanggal.split('-');
    let tanggalJS = `${bulan}-${hari}-${tahun}`;
    let timestampString = `${tanggalJS} ${waktu}`;
    let dateObj = new Date(timestampString);
    let timestampInMillis = dateObj.getTime();
    return timestampInMillis;

}

module.exports = {
    convmils,
    milsPlus,
    getRandomTimeInMillis,
    setStingTodate
}
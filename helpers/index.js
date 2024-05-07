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
module.exports = {
    convmils,
    milsPlus
}
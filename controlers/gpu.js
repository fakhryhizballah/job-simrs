require("dotenv").config();
const { createClient } = require("redis");
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_URL_PORT,
    },
});
client.connect();

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));


async function get() {
    let keys = await client.keys('fe4f37855f3c53d4dd93ef3180c3577f*');
    console.log(keys);
    if (keys.length > 0) {
        client.del(keys, (err) => {
            if (err) return console.log(err);
        });
    }
}

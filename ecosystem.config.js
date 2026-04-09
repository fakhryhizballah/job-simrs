module.exports = {
    apps: [{
        name: "node-app",
        script: "./crawling/obat.js",
        watch: true,
        env: {
            NODE_ENV: "development",
        }
    }]
}
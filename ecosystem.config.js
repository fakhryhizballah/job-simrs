module.exports = {
    apps: [{
        name: "node-app",
        script: "./crawling/job.js",
        watch: true,
        time: true,
        env: {
            NODE_ENV: "development",
        }
    }]
}
module.exports = {
    apps: [{
        name: "node-app",
        script: "./crawling/job.js",
        watch: true,
        env: {
            NODE_ENV: "development",
        }
    }]
}
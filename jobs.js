const fs = require('fs');

const scraper = require('./scraper.js');

async function runJob(job) {
    console.error(`Running job: ${job.name}`);

    // switch statement...
    await scraper.fetchAndStoreConfluenceData();
}

function runJobs() {
    try {
        let jobs = JSON.parse(fs.readFileSync('./jobs.json', 'utf8'));

        jobs.forEach((job) => {
            if (!job.lastRun || (new Date() - new Date(job.lastRun)) / (1000 * 60) >= job.frequencyInMinutes) {
                runJob(job);
                job.lastRun = new Date().toISOString();
            }
        });

        fs.writeFileSync('jobs.json', JSON.stringify(jobs, null, 2));
    } catch (error) {
        console.error(error);
    }
}

exports.runJobs = runJobs;
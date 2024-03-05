const express = require('express');
const path = require('path');
const fs = require('fs');

const jobs = require("./jobs.js");

const app = express();
const PORT = process.env.PORT || 3000;

function readDirectory(directoryPath, jsonData) {
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            readDirectory(filePath, jsonData);
        } else if (path.extname(file) === '.json') {
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (data && data.title) {
                    jsonData.push({ content: data.title, analysis: "Placeholder analysis" });
                }
            } catch (error) {
                console.error(error);
            }
        }
    });
}

app.get('/query', (req, res) => {
    try {
        const dataDirectory = path.join(__dirname, 'confluence_data');
        const jsonData = [];

        readDirectory(dataDirectory, jsonData);

        res.json(jsonData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    jobs.runJobs();
});

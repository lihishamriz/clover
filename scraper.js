const axios = require('axios');
const fs = require('fs');
const path = require('path');

const confluenceBaseUrl = 'https://orchen.atlassian.net/wiki';
const email = 'guy@clover.security';
const apiToken = 'ATATT3xFfGF0q-XsnMMoWuADsmMFG_w0iSJ1-w3VOBrO0QmC-0yHOagKkmRYvK6-mJByIYGAB8RI0Csza09hRoKBmLqJZkBp132Im0LtTDMF6th--E5PYzZf40Vw2Cjyfq9IDjz4ZMncxkfjmLmQJlqC6mkdB8ZJKn93cRvV0Fm1BoRini69hCo=BA5F57B3';

async function fetchConfluenceData(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Basic ${Buffer.from(
                    `${email}:${apiToken}`
                ).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

async function fetchAndStoreConfluenceData() {
    try {
        const spaces = await fetchConfluenceData(`${confluenceBaseUrl}/rest/api/space`);

        const dataDirectory = path.join(__dirname, 'confluence_data');
        if (!fs.existsSync(dataDirectory)) {
            fs.mkdirSync(dataDirectory);
        }

        for (const space of spaces.results.filter(result => result.type === 'global')) {
            const pages = await fetchConfluenceData(`${confluenceBaseUrl}/rest/api/space/${space.key}/content`);

            const spaceDirectory = path.join(dataDirectory, space.key);
            if (!fs.existsSync(spaceDirectory)) {
                fs.mkdirSync(spaceDirectory);
            }

            for (const page of pages.page.results) {
                const pageContent = await fetchConfluenceData(`${confluenceBaseUrl}/rest/api/content/${page.id}`);

                const filePath = path.join(spaceDirectory, `${page.id}.json`);
                fs.writeFileSync(filePath, JSON.stringify(pageContent, null, 2));
                console.log(`Page ${page.id} stored in file: ${filePath}`);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

exports.fetchAndStoreConfluenceData = fetchAndStoreConfluenceData;
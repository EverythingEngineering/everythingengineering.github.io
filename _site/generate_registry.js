const fs = require('fs');
const https = require('https');

// Configuration: List of repositories to track
// Format: { id: "feder", owner: "CodexFabrica", repo: "Feder" }
const products = [
    { id: "feder", owner: "CodexFabrica", repo: "Feder" },
    { id: "smartagrowater", owner: "WissenMachina", repo: "smartAgroWater" },
    // Add more here e.g. { id: "product_id", owner: "OrgName", repo: "RepoName" }
];

const outputFile = './api/registry.json';

async function fetchLatestRelease(owner, repo) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${owner}/${repo}/releases/latest`,
            method: 'GET',
            headers: {
                'User-Agent': 'EverythingEngineering-Update-Registry',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const release = JSON.parse(data);
                        resolve({
                            version: release.tag_name, // e.g., "v2.0.0"
                            url: release.html_url,
                            published_at: release.published_at,
                            name: release.name
                        });
                    } catch (e) {
                        reject(e);
                    }
                } else if (res.statusCode === 404) {
                    resolve(null); // No release found
                } else {
                    reject(new Error(`GitHub API Error: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function generateRegistry() {
    const registry = {};

    console.log("Fetching release information...");

    for (const p of products) {
        try {
            console.log(`Checking ${p.owner}/${p.repo}...`);
            const release = await fetchLatestRelease(p.owner, p.repo);

            if (release) {
                registry[p.id] = {
                    latestVersion: release.version,
                    downloadUrl: release.url,
                    releaseNotes: `Latest release: ${release.name}`,
                    lastChecked: new Date().toISOString()
                };
                console.log(`  -> Found ${release.version}`);
            } else {
                console.log(`  -> No release found.`);
                // Fallback or skip
                registry[p.id] = {
                    latestVersion: "0.0.0",
                    downloadUrl: "",
                    error: "No release found"
                };
            }
        } catch (e) {
            console.error(`  -> Error checking ${p.id}:`, e.message);
        }
    }

    fs.writeFileSync(outputFile, JSON.stringify(registry, null, 2));
    console.log(`\nRegistry saved to ${outputFile}`);
}

generateRegistry();

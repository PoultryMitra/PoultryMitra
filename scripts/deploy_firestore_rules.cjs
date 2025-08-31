const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');
(async () => {
  try {
    const keyPath = 'E:/Downloads/poultrymitra-9221e-firebase-adminsdk-fbsvc-4e196af893.json';
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    const project = key.project_id;
    const auth = new GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();

    const rulesContent = fs.readFileSync('e:/INFAN-local/fowl-front/firestore.rules', 'utf8');

    console.log('Creating ruleset...');
    const rulesetRes = await client.request({
      url: `https://firebaserules.googleapis.com/v1/projects/${project}/rulesets`,
      method: 'POST',
      data: {
        source: {
          files: [
            {
              name: 'firestore.rules',
              content: rulesContent
            }
          ]
        }
      }
    });

    const rulesetName = rulesetRes.data.name; // projects/{project}/rulesets/{id}
    console.log('Ruleset created:', rulesetName);

    // Publish release for Firestore
    const releaseId = 'firestore.rules';
    const releaseUrl = `https://firebaserules.googleapis.com/v1/projects/${project}/releases`;
    console.log('Publishing release...');
    const releaseRes = await client.request({
      url: releaseUrl,
      method: 'POST',
      data: {
        name: `projects/${project}/releases/${releaseId}`,
        rulesetName: rulesetName
      }
    });

    console.log('Release published:', releaseRes.data.name);
    process.exit(0);
  } catch (err) {
    console.error('Deploy failed:', err.response && err.response.data ? err.response.data : err.message);
    process.exit(1);
  }
})();

const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');
(async () => {
  try {
    const keyPath = 'E:/Downloads/poultrymitra-9221e-firebase-adminsdk-fbsvc-4e196af893.json';
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    const auth = new GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const project = key.project_id;

    const collectionId = encodeURIComponent('dealerProducts');
    const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/collectionGroups/${collectionId}/indexes`;
    const res = await client.request({ url });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error listing indexes:', err.response && err.response.data ? err.response.data : err.message);
    process.exit(1);
  }
})();

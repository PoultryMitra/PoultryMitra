const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');
(async () => {
  try {
    const key = JSON.parse(fs.readFileSync('E:/Downloads/poultrymitra-9221e-firebase-adminsdk-fbsvc-4e196af893.json','utf8'));
    const auth = new GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const project = key.project_id;

    try {
      const svc = await client.request({ url: `https://serviceusage.googleapis.com/v1/projects/${project}/services/firestore.googleapis.com` });
      console.log('SERVICE:', JSON.stringify(svc.data, null, 2));
    } catch (e) {
      console.error('SERVICE_ERROR:', e.response && e.response.data || e.message);
    }

    try {
      const db = await client.request({ url: `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)` });
      console.log('DATABASE:', JSON.stringify(db.data, null, 2));
    } catch (e) {
      console.error('DATABASE_ERROR:', e.response && e.response.data || e.message);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

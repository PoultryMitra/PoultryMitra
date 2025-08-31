const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');
(async () => {
  try {
    const keyPath = 'E:/Downloads/poultrymitra-9221e-firebase-adminsdk-fbsvc-4e196af893.json';
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    const project = key.project_id;
    const auth = new GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();

    const releaseName = `projects/${project}/releases/firestore.rules`;
    const url = `https://firebaserules.googleapis.com/v1/${releaseName}`;
    const res = await client.request({ url });
    console.log('Published release info:');
    console.log(JSON.stringify(res.data, null, 2));

    if (res.data?.rulesetName) {
      const rsUrl = `https://firebaserules.googleapis.com/v1/${res.data.rulesetName}`;
      const rs = await client.request({ url: rsUrl });
      console.log('Ruleset details:');
      if (rs.data && rs.data.source && rs.data.source.files) {
        rs.data.source.files.forEach(f => {
          console.log('--- file:', f.name);
          console.log(f.content);
        });
      } else {
        console.log(JSON.stringify(rs.data, null, 2));
      }
    }
  } catch (err) {
    console.error('Failed to fetch published rules:', err.response && err.response.data ? err.response.data : err.message);
    process.exit(1);
  }
})();

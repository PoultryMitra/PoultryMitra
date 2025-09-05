const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');
(async () => {
  try {
    const keyPath = 'E:/Downloads/poultrymitra-9221e-firebase-adminsdk-fbsvc-4e196af893.json';
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    const auth = new GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const project = key.project_id;

    const collectionId = encodeURIComponent('adminPosts');
    const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/collectionGroups/${collectionId}/indexes`;
    const body = {
      fields: [
        { fieldPath: 'isPublished', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ],
      queryScope: 'COLLECTION'
    };

    try {
      const res = await client.request({ url, method: 'POST', data: body });
      console.log('create-index response:', res.data);
    } catch (e) {
      const err = e.response && e.response.data ? e.response.data : e.message;
      console.error('create-index failed:', JSON.stringify(err, null, 2));
      process.exit(2);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

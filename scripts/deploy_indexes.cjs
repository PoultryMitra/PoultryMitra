const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');
(async () => {
  try {
    const keyPath = 'E:/Downloads/poultrymitra-9221e-firebase-adminsdk-fbsvc-4e196af893.json';
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    const auth = new GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const project = key.project_id;
    const doc = JSON.parse(fs.readFileSync('e:/INFAN-local/fowl-front/firestore.indexes.json', 'utf8'));
    const indexes = doc.indexes || [];

    for (const idx of indexes) {
      const collectionId = encodeURIComponent(idx.collectionGroup);
      const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/collectionGroups/${collectionId}/indexes`;
      const body = {
        fields: idx.fields.map(f => {
          const out = { fieldPath: f.fieldPath };
          if (f.order) out.order = f.order;
          if (f.arrayConfig) out.arrayConfig = f.arrayConfig;
          return out;
        }),
        queryScope: idx.queryScope || 'COLLECTION'
      };
      try {
        const res = await client.request({ url, method: 'POST', data: body });
        console.log('created', idx.collectionGroup, res.data.name || res.data);
      } catch (e) {
        const err = e.response && e.response.data ? JSON.stringify(e.response.data) : e.message;
        console.error('failed', idx.collectionGroup, err);
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

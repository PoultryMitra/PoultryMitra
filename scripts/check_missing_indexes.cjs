const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');

function fieldsEqual(a, b) {
  // Ignore any __name__ fields added by Firestore when comparing
  const af = a.filter(f => f.fieldPath !== '__name__');
  const bf = b.filter(f => f.fieldPath !== '__name__');
  if (af.length !== bf.length) return false;
  for (let i = 0; i < af.length; i++) {
    if (af[i].fieldPath !== bf[i].fieldPath) return false;
    const ao = af[i].order || af[i].arrayConfig || null;
    const bo = bf[i].order || bf[i].arrayConfig || null;
    if (ao !== bo) return false;
  }
  return true;
}

(async () => {
  try {
    const keyPath = 'E:/Downloads/poultrymitra-9221e-firebase-adminsdk-fbsvc-4e196af893.json';
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    const auth = new GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const project = key.project_id;
    const desired = JSON.parse(fs.readFileSync('e:/INFAN-local/fowl-front/firestore.indexes.json','utf8')).indexes || [];

    const missing = [];

    for (const idx of desired) {
      const collectionId = encodeURIComponent(idx.collectionGroup);
      const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/collectionGroups/${collectionId}/indexes`;
      try {
        const res = await client.request({ url });
        const existing = res.data.indexes || [];
        // Normalize existing fields arrays
        const found = existing.some(e => {
          const efields = (e.fields || []).map(f => ({ fieldPath: f.fieldPath, order: f.order, arrayConfig: f.arrayConfig }));
          const dfields = (idx.fields || []).map(f => ({ fieldPath: f.fieldPath, order: f.order, arrayConfig: f.arrayConfig }));
          return fieldsEqual(efields, dfields) && (e.queryScope || 'COLLECTION') === (idx.queryScope || 'COLLECTION');
        });
        if (!found) {
          missing.push({ collectionGroup: idx.collectionGroup, fields: idx.fields, queryScope: idx.queryScope });
        }
      } catch (e) {
        console.error('ERROR fetching indexes for', idx.collectionGroup, (e.response && e.response.data) || e.message);
        missing.push({ collectionGroup: idx.collectionGroup, error: (e.response && e.response.data) || e.message });
      }
    }

    if (missing.length === 0) {
      console.log('All indexes present.');
    } else {
      console.log('Missing indexes:');
      for (const m of missing) {
        console.log(JSON.stringify(m, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

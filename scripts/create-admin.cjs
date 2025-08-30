#!/usr/bin/env node
/*
Creates a Firebase auth user and sets the `admin` custom claim.
Usage:
  - Install dependencies (already present): firebase-admin
  - Set env var GOOGLE_APPLICATION_CREDENTIALS to point to service account JSON
  - Run: node scripts/create-admin.cjs --email admin@poultrymitra.com --password Admin@123

This script is intentionally minimal and asks for confirmation before creating a user.
*/

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function argv(name) {
  const key = `--${name}`;
  const idx = process.argv.indexOf(key);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  const email = argv('email');
  const password = argv('password');
  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.cjs --email admin@... --password YourPass');
    process.exit(1);
  }

  // Initialize admin SDK using GOOGLE_APPLICATION_CREDENTIALS or default credentials
  if (!admin.apps.length) {
    try {
      admin.initializeApp();
    } catch (err) {
      console.error('Failed to initialize firebase-admin. Make sure GOOGLE_APPLICATION_CREDENTIALS env var points to a service account JSON.');
      console.error(err.message || err);
      process.exit(1);
    }
  }

  const auth = admin.auth();

  console.log(`About to create or update admin user: ${email}`);
  const confirm = await new Promise((resolve) => {
    process.stdout.write('Type YES to continue: ');
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data) => resolve(String(data || '').trim()));
  });

  if (confirm !== 'YES') {
    console.log('Aborted.');
    process.exit(0);
  }

  try {
    // Try to find existing user
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('User exists — updating password if provided and continuing to set admin claim.');
      await auth.updateUser(userRecord.uid, { password });
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/user-not-found') {
        // create
        userRecord = await auth.createUser({ email, password });
        console.log('User created:', userRecord.uid);
      } else {
        throw err;
      }
    }

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('Custom claim { admin: true } set for', userRecord.uid);

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating/updating admin user:');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

main();

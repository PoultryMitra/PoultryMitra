import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load the service account key
const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function deleteAllUsers() {
  try {
    console.log('🔥 Firebase User Deletion Script');
    console.log('⚠️  WARNING: This will delete ALL 31 users from Firebase Auth!');
    console.log('Press Ctrl+C within 10 seconds to cancel...\n');
    
    // Wait 10 seconds for user to cancel
    for (let i = 10; i > 0; i--) {
      process.stdout.write(`\rStarting in ${i} seconds... `);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n\nStarting user deletion process...\n');

    const auth = admin.auth();
    let nextPageToken;
    let usersDeleted = 0;
    let totalUsers = 0;

    do {
      // List users in batches of 1000 (max allowed)
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      
      if (listUsersResult.users.length === 0) {
        console.log('✅ No more users to delete.');
        break;
      }

      totalUsers += listUsersResult.users.length;
      console.log(`📋 Found ${listUsersResult.users.length} users in this batch...`);

      // Show user emails for confirmation
      listUsersResult.users.slice(0, 5).forEach(user => {
        console.log(`   - ${user.email || user.uid}`);
      });
      if (listUsersResult.users.length > 5) {
        console.log(`   ... and ${listUsersResult.users.length - 5} more users`);
      }

      // Extract UIDs
      const uids = listUsersResult.users.map(user => user.uid);
      
      console.log(`🗑️  Deleting ${uids.length} users...`);
      
      // Delete users in batch
      const deleteUsersResult = await auth.deleteUsers(uids);
      
      console.log(`✅ Successfully deleted ${deleteUsersResult.successCount} users`);
      if (deleteUsersResult.failureCount > 0) {
        console.log(`❌ Failed to delete ${deleteUsersResult.failureCount} users:`);
        deleteUsersResult.errors.forEach((err) => {
          console.log(`   - UID: ${err.index}, Error: ${err.error.message}`);
        });
      }

      usersDeleted += deleteUsersResult.successCount;
      nextPageToken = listUsersResult.pageToken;
      
      console.log(''); // Empty line for readability
      
    } while (nextPageToken);

    console.log('🎉 DELETION COMPLETE!');
    console.log(`📊 Total users processed: ${totalUsers}`);
    console.log(`✅ Total users deleted: ${usersDeleted}`);
    console.log('🔄 You can now refresh the Firebase Console to see the changes.');
    
  } catch (error) {
    console.error('❌ Error deleting users:', error.message);
    if (error.code === 'app/invalid-credential') {
      console.log('\n💡 Make sure you have:');
      console.log('   1. Downloaded the service account key JSON file');
      console.log('   2. Updated the path in this script');
      console.log('   3. The key file has the correct permissions');
    }
  } finally {
    // Clean up
    admin.app().delete();
    process.exit(0);
  }
}

// Run the function
deleteAllUsers();

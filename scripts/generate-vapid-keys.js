// Script to generate VAPID keys for web push notifications
const webpush = require('web-push');

console.log('\n🔐 Generating VAPID Keys for Web Push Notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys Generated Successfully!\n');
console.log('Add these to your .env.local file:\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('\n');
console.log('⚠️  Keep the private key SECRET - never commit it to version control!\n');


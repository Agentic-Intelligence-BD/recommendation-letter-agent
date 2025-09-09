const crypto = require('crypto');

// Generate a secure random JWT secret
const secret = crypto.randomBytes(64).toString('hex');

console.log('\n🔐 Generated JWT Secret for Production:');
console.log('=====================================');
console.log(secret);
console.log('\n📋 Add this to your Vercel environment variables:');
console.log(`JWT_SECRET=${secret}`);
console.log('\n⚠️  Keep this secret secure and never commit it to version control!');
const { generateRefreshToken } = require('./generateRefreshToken');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('🔐 Gmail Authorization & Token Generation\n');
    console.log('This script will generate a new token.json file for Gmail API access.\n');
    
    // Check if token.json already exists
    const tokenPath = path.join(process.cwd(), 'token.json');
    if (fs.existsSync(tokenPath)) {
      console.log('⚠️  token.json already exists.');
      console.log('   If you\'re getting authentication errors, you may need to regenerate it.\n');
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Do you want to regenerate token.json? (y/n): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('\n✅ Keeping existing token.json');
        process.exit(0);
      }
      console.log('\n🔄 Regenerating token.json...\n');
    }
    
    // Generate new token
    const tokens = await generateRefreshToken();
    
    if (tokens && tokens.refresh_token) {
      console.log('\n✅ SUCCESS! token.json has been generated/updated.');
      console.log('   You can now run your tests that require Gmail API access.\n');
    } else {
      console.log('\n⚠️  Warning: No refresh token was generated.');
      console.log('   You may need to revoke access in Google Account settings and try again.\n');
    }
  } catch (error) {
    console.error('\n❌ Authorization failed:', error.message);
    console.error('\n💡 Make sure you have the following in your .env.local file:');
    console.error('   - GOOGLE_CLIENT_ID');
    console.error('   - GOOGLE_CLIENT_SECRET');
    console.error('   - GOOGLE_REDIRECT_URI\n');
    process.exit(1);
  }
}

main();


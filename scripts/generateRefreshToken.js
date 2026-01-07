const { google } = require("googleapis");
const fs = require("fs");
const readline = require("readline");
require("dotenv").config();
require("dotenv").config({ path: '.env.local' });

/**
 * Script to generate a new Google OAuth refresh token
 * This will use the credentials from .env.local to generate a new token
 * 
 * IMPORTANT: Refresh tokens are LONG-LIVED and don't expire daily!
 * - They can last indefinitely if used regularly
 * - They may expire after 6 months of non-use
 * - You only need to regenerate if:
 *   1. You get an "invalid_grant" error
 *   2. The token was revoked in Google Account settings
 *   3. Your OAuth app credentials changed
 * 
 * Run this script ONCE to get a refresh token, then add it to .env.local
 */
async function generateRefreshToken() {
    const {
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    } = process.env;

    // Validate required environment variables
    if (!GOOGLE_CLIENT_ID) {
        console.error('❌ GOOGLE_CLIENT_ID is not set in .env.local');
        console.error('   Please add GOOGLE_CLIENT_ID to your .env.local file');
        process.exit(1);
    }
    if (!GOOGLE_CLIENT_SECRET) {
        console.error('❌ GOOGLE_CLIENT_SECRET is not set in .env.local');
        console.error('   Please add GOOGLE_CLIENT_SECRET to your .env.local file');
        process.exit(1);
    }
    if (!GOOGLE_REDIRECT_URI) {
        console.error('❌ GOOGLE_REDIRECT_URI is not set in .env.local');
        console.error('   Please add GOOGLE_REDIRECT_URI to your .env.local file');
        process.exit(1);
    }

    console.log('🔐 Generating new Google OAuth refresh token...\n');
    console.log(`Using Client ID: ${GOOGLE_CLIENT_ID.substring(0, 20)}...`);
    console.log(`Redirect URI: ${GOOGLE_REDIRECT_URI}\n`);

    const oAuth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );

    // Generate the authorization URL
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/gmail.readonly"],
        prompt: "consent" // Force consent to get refresh token
    });

    console.log('👉 Please follow these steps:\n');
    console.log('1. Open this URL in your browser:');
    console.log(`   ${authUrl}\n`);
    console.log('2. Sign in with your Google account');
    console.log('3. Grant the requested permissions');
    console.log('4. Copy the authorization code from the URL or the page\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve, reject) => {
        rl.question('Paste the authorization code here: ', async (code) => {
            rl.close();

            try {
                const { tokens } = await oAuth2Client.getToken(code.trim());
                
                console.log('\n✅ Successfully generated tokens!\n');
                console.log('📝 Add this to your .env.local file:\n');
                console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
                
                if (tokens.refresh_token) {
                    console.log('✅ Refresh token generated successfully!');
                    console.log('   Copy the GOOGLE_REFRESH_TOKEN value above to your .env.local file\n');
                } else {
                    console.log('⚠️  Warning: No refresh token in response.');
                    console.log('   This might happen if you\'ve already authorized this app before.');
                    console.log('   Try revoking access in your Google Account settings and run this script again.\n');
                }

                // Optionally save to token.json for reference
                const tokenPath = 'token.json';
                fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
                console.log(`💾 Tokens also saved to ${tokenPath} for reference\n`);

                resolve(tokens);
            } catch (error) {
                console.error('\n❌ Error generating token:', error.message);
                if (error.message.includes('invalid_grant')) {
                    console.error('\n   This usually means:');
                    console.error('   - The authorization code has expired (they expire quickly)');
                    console.error('   - The code was already used');
                    console.error('   - The code is incorrect\n');
                    console.error('   Please run this script again and paste a fresh code.\n');
                }
                reject(error);
            }
        });
    });
}

// Run if called directly
if (require.main === module) {
    generateRefreshToken()
        .then(() => {
            console.log('✅ Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Failed to generate refresh token');
            process.exit(1);
        });
}

module.exports = { generateRefreshToken };


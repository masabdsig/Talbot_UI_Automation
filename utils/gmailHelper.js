const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
// Load environment variables from .env and .env.local files
// Priority order (highest to lowest):
// 1. Environment variables set directly (e.g., GitHub Actions secrets)
// 2. .env.local (for local development - gitignored)
// 3. .env (for CI/shared config)
// Note: dotenv.config() silently fails if file doesn't exist, so this works in both CI and local
require("dotenv").config(); // Load .env (used in CI)
require("dotenv").config({ path: '.env.local' }); // Load .env.local (local only, gitignored)

const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "utils/credentials.json");

// async function authorize() {
//     const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

//     const { client_secret, client_id, redirect_uris } = credentials.installed;

//     const oAuth2Client = new google.auth.OAuth2(
//         client_id,
//         client_secret,
//         redirect_uris[0]
//     );

//     if (fs.existsSync(TOKEN_PATH)) {
//         oAuth2Client.setCredentials(
//             JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"))
//         );
//         return oAuth2Client;
//     }

//     const authUrl = oAuth2Client.generateAuthUrl({
//         access_type: "offline",
//         scope: ["https://www.googleapis.com/auth/gmail.readonly"],
//     });

//     console.log("\n👉 Open this URL in your browser:\n");
//     console.log(authUrl);

//     const readline = require("readline").createInterface({
//         input: process.stdin,
//         output: process.stdout,
//     });

//     return new Promise((resolve, reject) => {
//         readline.question("\nPaste the code here: ", async code => {
//             readline.close();

//             try {
//                 const { tokens } = await oAuth2Client.getToken(code);
//                 oAuth2Client.setCredentials(tokens);

//                 fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
//                 console.log("\n✅ Token saved to:", TOKEN_PATH);
//                 resolve(oAuth2Client);
//             } catch (err) {
//                 reject(err);
//             }
//         });
//     });
// }

// push to Github Actions
async function authorize() {
    const {
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI,
        GOOGLE_REFRESH_TOKEN
    } = process.env;

    // Validate required environment variables
    if (!GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID is not set in environment variables. Please check your .env or .env.local file.');
    }
    if (!GOOGLE_CLIENT_SECRET) {
        throw new Error('GOOGLE_CLIENT_SECRET is not set in environment variables. Please check your .env or .env.local file.');
    }
    if (!GOOGLE_REDIRECT_URI) {
        throw new Error('GOOGLE_REDIRECT_URI is not set in environment variables. Please check your .env or .env.local file.');
    }
    if (!GOOGLE_REFRESH_TOKEN) {
        throw new Error('GOOGLE_REFRESH_TOKEN is not set in environment variables. Please check your .env or .env.local file.');
    }

    const oAuth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );

    oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

    return oAuth2Client;
}

// ---- Decode base64url ----
function decodeBase64Url(data) {
    if (!data) return "";
    data = data.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(data, "base64").toString("utf8");
}

// ---- New safer decoder: handle HTML + nested parts ----
function decodeBody(message) {
    if (!message?.payload) return "";

    const payload = message.payload;

    // Direct body
    if (payload.body?.data) {
        return decodeBase64Url(payload.body.data);
    }

    // Parts
    if (payload.parts && payload.parts.length) {
        for (const part of payload.parts) {
            if (part.mimeType === "text/plain" && part.body?.data) {
                return decodeBase64Url(part.body.data);
            }
            if (part.mimeType === "text/html" && part.body?.data) {
                return decodeBase64Url(part.body.data);
            }
            if (part.parts) {
                const nested = decodeBody({ payload: part });
                if (nested) return nested;
            }
        }
    }

    return "";
}

async function getLatestEmail(subjectContains, fromEmail = null, maxResults = 10, afterTimestamp = null) {
    let auth;
    try {
        auth = await authorize();
    } catch (error) {
        if (error.message.includes('not set in environment variables')) {
            throw error;
        }
        throw new Error(`Failed to authorize Gmail API: ${error.message}`);
    }
    
    const gmail = google.gmail({ version: "v1", auth });

    let query = '';
    if (subjectContains) query = `subject:${subjectContains}`;
    if (fromEmail) query += query ? ` from:${fromEmail}` : `from:${fromEmail}`;

    // Add date filter if timestamp provided (only get emails after this time)
    if (afterTimestamp) {
        // Convert timestamp to Gmail date format (seconds since epoch)
        const dateSeconds = Math.floor(afterTimestamp / 1000);
        const dateFilter = `after:${dateSeconds}`;
        query += query ? ` ${dateFilter}` : dateFilter;
    }

    if (!query) query = 'is:unread';

    let res;
    try {
        res = await gmail.users.messages.list({
            userId: "me",
            q: query,
            maxResults: maxResults,
        });
    } catch (error) {
        if (error.message && error.message.includes('invalid_grant')) {
            throw new Error(
                'invalid_grant: Your Google OAuth refresh token is invalid or expired. ' +
                'This usually happens when:\n' +
                '  1. The refresh token has expired\n' +
                '  2. The refresh token doesn\'t match the client ID/secret in your .env.local file\n' +
                '  3. The token was revoked\n\n' +
                'To fix this:\n' +
                '  1. Verify your GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in .env.local are correct\n' +
                '  2. If using token.json, ensure it matches your current credentials\n' +
                '  3. You may need to regenerate your refresh token by running: node scripts/authorizeGmail.js\n' +
                '  4. Make sure your .env.local file is in the project root directory'
            );
        }
        throw error;
    }

    if (!res.data.messages?.length) {
        console.log(`⚠️ No emails found with query: ${query}`);
        return null;
    }

    // Fetch all messages to sort by date
    const messages = await Promise.all(
        res.data.messages.map(async (msg) => {
            const fullMsg = await gmail.users.messages.get({
                userId: "me",
                id: msg.id,
                format: 'full'
            });

            const emailData = {
                id: fullMsg.data.id,
                threadId: fullMsg.data.threadId,
                snippet: fullMsg.data.snippet,
                body: decodeBody(fullMsg.data),
                headers: {},
                internalDate: fullMsg.data.internalDate || 0
            };

            if (fullMsg.data.payload?.headers) {
                fullMsg.data.payload.headers.forEach(header => {
                    emailData.headers[header.name.toLowerCase()] = header.value;
                });
            }

            return emailData;
        })
    );

    // Sort by internalDate (newest first) - internalDate is in milliseconds
    messages.sort((a, b) => {
        const dateA = parseInt(a.internalDate) || 0;
        const dateB = parseInt(b.internalDate) || 0;
        return dateB - dateA; // Descending order (newest first)
    });

    // Return the newest email (first in sorted array)
    return messages[0];
}

async function getOTPFromLatestEmail(fromEmail, waitTime = 5000, maxRetries = 6, afterTimestamp = null) {
    console.log(`\n⏳ Waiting for latest email from ${fromEmail}...`);
    console.log(`   Waiting ${waitTime / 1000} seconds for email to arrive...`);

    if (afterTimestamp) {
        console.log(`   Filtering emails sent after: ${new Date(afterTimestamp).toISOString()}`);
    }

    // Wait initially for email to arrive
    await new Promise(resolve => setTimeout(resolve, waitTime));

    let emailData = null;
    let lastEmailDate = null;
    let retryCount = 0;

    // Retry logic to ensure we get the absolute latest email
    while (retryCount < maxRetries) {
        try {
            // Fetch multiple emails and get the newest one (filtered by timestamp if provided)
            const currentEmail = await getLatestEmail(null, fromEmail, 10, afterTimestamp);

            if (!currentEmail) {
                if (retryCount < maxRetries - 1) {
                    console.log(`   No email found yet, retrying in 3 seconds... (attempt ${retryCount + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    retryCount++;
                    continue;
                } else {
                    throw new Error(`No email found from sender: ${fromEmail} after ${maxRetries} attempts`);
                }
            }

            // Check if this is a newer email than the previous one
            const currentDate = parseInt(currentEmail.internalDate) || 0;
            const currentDateObj = new Date(currentDate);

            if (lastEmailDate === null || currentDate > lastEmailDate) {
                // This is a newer email, use it
                emailData = currentEmail;
                lastEmailDate = currentDate;
                console.log(`   ✓ Found newer email dated: ${currentDateObj.toISOString()} (${currentEmail.headers.date || 'N/A'})`);

                // Wait a bit more to see if an even newer email arrives
                if (retryCount < maxRetries - 1) {
                    console.log(`   Waiting 2 more seconds to check for even newer email...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    retryCount++;
                } else {
                    // We've checked enough times, use this email
                    console.log(`   ✓ Using latest email after ${maxRetries} checks`);
                    break;
                }
            } else {
                // No newer email found, use the one we already have
                const lastDateObj = new Date(lastEmailDate);
                console.log(`   ✓ Confirmed latest email (no newer emails found)`);
                console.log(`   Latest email date: ${lastDateObj.toISOString()}`);
                break;
            }
        } catch (error) {
            if (retryCount < maxRetries - 1) {
                console.log(`   Error: ${error.message}, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                retryCount++;
            } else {
                throw error;
            }
        }
    }

    if (!emailData) throw new Error(`No email found from sender: ${fromEmail}`);

    // Clean body: strip HTML tags
    const cleanBody = emailData.body
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const fullContent = (emailData.headers.subject + ' ' + cleanBody);

    console.log('\n========================================');
    console.log('📧 Latest Email Details:');
    console.log('========================================');
    console.log(`From: ${emailData.headers.from || 'N/A'}`);
    console.log(`To: ${emailData.headers.to || 'N/A'}`);
    console.log(`Subject: ${emailData.headers.subject || 'N/A'}`);
    console.log(`Date: ${emailData.headers.date || 'N/A'}`);
    console.log('\nEmail Body:');
    console.log('----------------------------------------');
    console.log(cleanBody);
    console.log('----------------------------------------\n');

    const otpPatterns = [
        /verification code[:\s]+(\d{4,6})/i,
        /code[:\s]+is[:\s]+(\d{4,6})/i,
        /code[:\s]+(\d{4,6})/i,
        /otp[:\s]+(\d{4,6})/i,
        /your code[:\s]+(\d{4,6})/i,
        /password reset code[:\s]+(\d{4,6})/i,
        /reset code[:\s]+(\d{4,6})/i
    ];

    let otpCode = null;

    for (const pattern of otpPatterns) {
        const match = fullContent.match(pattern);
        if (match && match[1]) {
            otpCode = match[1];
            break;
        }
    }

    if (!otpCode) {
        const standaloneCodes = fullContent.match(/\b(\d{4,6})\b/g);
        if (standaloneCodes?.length) otpCode = standaloneCodes[0];
    }

    if (otpCode) {
        console.log(`\n✅ OTP Code Extracted: ${otpCode}\n`);
        return otpCode;
    } else {
        console.log('\n⚠️ Could not extract OTP code from email');
        return null;
    }
}

if (require.main === module) {
    (async () => {
        try {
            const email = await getLatestEmail("Verification");
            console.log("\n📩 Email content:\n");
            console.log(email);
        } catch (err) {
            console.error(err.message);
        }
    })();
}

module.exports = { getLatestEmail, getOTPFromLatestEmail, authorize };

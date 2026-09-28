const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const CREDENTIALS_PATH = 'credentials.json';

// Load client secrets from a local file.
fs.readFile(CREDENTIALS_PATH, (err, content) => {
  if (err) return console.log('Error loading client secret file. Make sure you placed credentials.json in the backend folder:', err);
  
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content));
});

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  // Use the first redirect URI, usually 'http://localhost' for desktop apps
  const redirect_uri = redirect_uris ? redirect_uris[0] : 'http://localhost';
  
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uri);

  getAccessToken(oAuth2Client, client_id, client_secret, redirect_uri);
}

function getAccessToken(oAuth2Client, clientId, clientSecret, redirectUri) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Forces it to return a refresh token
  });
  console.log('----------------------------------------------------');
  console.log('1. Go to this URL in your browser:');
  console.log('\n', authUrl, '\n');
  console.log('----------------------------------------------------');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  rl.question('2. Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      
      console.log('\n================ SUCCESS ================');
      console.log('You successfully authenticated!');
      console.log('Please add the following variables to your Render Environment Variables AND your local .env file in the backend:\n');
      console.log(`GOOGLE_CLIENT_ID=${clientId}`);
      console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
      console.log(`GOOGLE_REDIRECT_URI=${redirectUri}`);
      console.log(`GOOGLE_REFRESH_TOKEN=${token.refresh_token}`);
      console.log('=========================================\n');
      console.log('Note: Keep these secret! You can now safely delete credentials.json from your server/repo.');
    });
  });
}

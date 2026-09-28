const { google } = require('googleapis');
const stream = require('stream');

function getDriveService() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  return drive;
}

/**
 * Uploads a file to Google Drive and sets it to be publicly viewable.
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - The webViewLink of the uploaded file
 */
async function uploadToDrive(file) {
  const drive = getDriveService();
  if (!drive) {
    throw new Error('Google Drive credentials are not configured in environment variables.');
  }

  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);

  try {
    // 1. Upload the file
    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        // Optionally specify a parent folder ID here
        // parents: ['YOUR_FOLDER_ID'] 
      },
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = response.data.id;

    // 2. Make the file publicly accessible so anyone can view it
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // 3. Return the view link
    return response.data.webViewLink;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw new Error('Failed to upload file to Google Drive');
  }
}

module.exports = {
  uploadToDrive
};

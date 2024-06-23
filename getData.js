const { google } = require('googleapis');
const fs = require('fs');



//main 002
const CLIENT_ID = '452031363818-5kblklun3japt3557vqbe7g32qk16b2t.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04MZpYcpoas6GCgYIARAAGAQSNwF-L9IrPwK-87tUC7X7bHyQvqUruxv6PDsMntql9wpmkoXkFZIMblG0CufwarYYCqBkJ0c9oYc';

const connectGoogleDrive = (CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN) =>{
  const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    return google.drive({ version: 'v3', auth: oauth2Client });
}

const drive = connectGoogleDrive(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN)

async function listAllFolders() {
  try {
    const folders = [];
    let pageToken = null;
    do {
      const response = await drive.files.list({
        q: "mimeType = 'application/vnd.google-apps.folder'",
        fields: 'nextPageToken, files(id, name)',
        pageToken: pageToken,
      });
      const files = response.data.files;
      if (files.length) {
        folders.push(...files);
        pageToken = response.data.nextPageToken;
      } else {
        pageToken = null;
      }
    } while (pageToken);
    return folders;
  } catch (error) {
    console.error('Error listing folders:', error);
  }
}

async function getFileByFolder(folderId, keyWork) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and name contains '${keyWork}'`,
      fields: 'files(id, name, thumbnailLink, mimeType)',
      pageSize: 1
    });
    let file = response.data.files[0]
    file.thumbnailLink = file.thumbnailLink.slice(0, -5)
    return file

  } catch (error) {
    console.error('Error listing files:', error);
  }
}

async function listFilesByFolder(folderId) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/')`,
      fields: 'files(id, name, thumbnailLink, mimeType)',
      orderBy: 'name',
      pageSize: 500
    });

    const files = response.data.files.map(file => {
      return {
        ...file,
        thumbnailLink: file.thumbnailLink.slice(0, -5)
      };
    });
    
    return files;
  } catch (error) {
    console.log(error.message);
  }
}


async function getData(){
  const folderList = await listAllFolders();
  
  const promises = folderList.map(async (folder) => {
    const folderId = folder.id;
    let avata = await getFileByFolder(folderId, 'avata');
    if (!avata){
      avata = {
        id: '1eEfkXIh3-3iDEAhMSBCm5FPYMPjjU3X3'
      }
    }
    folder.avata = avata;

    let listImage = await listFilesByFolder(folderId);
    folder.listImage = listImage;
  });
  await Promise.all(promises);
  fs.writeFileSync('data.json', JSON.stringify(folderList, null, 2), 'utf-8');
  console.log('Lấy dữ liệu thành công');
}

getData();


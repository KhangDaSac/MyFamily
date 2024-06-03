const { google } = require('googleapis');
import configViewEngine from '../config/viewEngine';
import connectGoogleDrive from "../config/connectGoogleDrive"
require('dotenv').config()
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT;

configViewEngine(app);


//main
const CLIENT_ID = '452031363818-5kblklun3japt3557vqbe7g32qk16b2t.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04PuLZTud_GL5CgYIARAAGAQSNwF-L9IrQgo1MIkQP0NMM_zEm7aU5TY9M1vbSOEjwrIEv5u-GHTe6fdG1Bn2qkD-OEu0qyd26h4';
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

async function getFolderIdByName(namePrefix) {
  try {
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name contains '${namePrefix}' and trashed = false`,
      fields: 'files(id, name)',
    });
    const folders = response.data.files;
    const matchingFolder = folders.find(folder => folder.name.startsWith(namePrefix));
    if (!matchingFolder) {
      return null;
    } else {
      return matchingFolder;
    }
  } catch (error) {
    console.error('Error retrieving folder ID:', error.message);
    return null;
  }
}

async function getFileByFolder(folderId, keyWork) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and name contains '${keyWork}'`,
      fields: 'files(id, name)',
      pageSize: 1
    });

    return response.data.files[0]

  } catch (error) {
    console.error('Error listing files:', error);
  }
}

async function listFilesByFolder(folderId) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/'`,
      fields: 'files(id, name)',
      orderBy: 'name',
      pageSize: 500
    });
    return response.data.files;
  } catch (error) {
    console.log(error.message);
  }
}


// Hàm để tải về các tệp tin ảnh dưới dạng Buffer
async function downloadFile(fileId) {
  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    return Buffer.from(response.data);
  } catch (error) {
    console.log(error.message);
  }
}



// Endpoint để phục vụ tệp HTML
app.use(express.static(path.join(__dirname)));


// Endpoint để tải một ảnh cụ thể
app.get('/image/:fileId', async (req, res) => {
  const fileId = req.params.fileId;
  const buffer = await downloadFile(fileId);
  res.setHeader('Content-Type', 'image/jpeg'); // Thay đổi nếu cần thiết
  res.send(buffer);
});

app.get('/collection/id=:folderId', async (req, res) =>{
  const folderId = req.params.folderId;
  const files = await listFilesByFolder(folderId);
  res.render('collection.ejs', { files });
});

app.get('/collection/:folderName', async (req, res) => {
  const folderName = decodeURIComponent(req.params.folderName);
  
  try {
    const folder = await getFolderIdByName(folderName);
    const folderId = folder.id;
    if (!folderId) {
      return res.status(404).send(`Folder with name ${folderName} not found.`);
    }
    const files = await listFilesByFolder(folderId);
    const fileData = folder.name.split(';');
    res.render('collection.ejs', { files,  fileData});
  } catch (error) {
    res.status(500).send('Error retrieving files.');
  }
});



app.get('/', async (req, res) => {
  res.redirect('/home');
});

app.get('/home', async (req, res) => {
  res.render('home.ejs')
});

app.get('/collection-list', async (req, res) => {
  try {
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
    });
    await Promise.all(promises);

    res.render('collection-list.ejs', { folderList});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error retrieving folder list.');
  }
});


app.get('/collection', async (req, res) => {
  res.render('collection.ejs')
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

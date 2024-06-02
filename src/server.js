const { google } = require('googleapis');
import configViewEngine from '../config/viewEngine';
import connectGoogleDrive from "../config/connectGoogleDrive"
require('dotenv').config()
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT;

configViewEngine(app);

//Test
// const CLIENT_ID = '1051455385042-5rhjf6mpbe3jh3rtscoc2ktgmf5i5d6n.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
// const REFRESH_TOKEN = '1//04Q3vY3FlbQ6_CgYIARAAGAQSNwF-L9IrdbPDTbEVOEXuU_AWnUtwdeKECMlqU1ZEddVCoV4eudPARbuWWNvys0j7-hGGmUqS5nY';


//main
const CLIENT_ID = '452031363818-5kblklun3japt3557vqbe7g32qk16b2t.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04PuLZTud_GL5CgYIARAAGAQSNwF-L9IrQgo1MIkQP0NMM_zEm7aU5TY9M1vbSOEjwrIEv5u-GHTe6fdG1Bn2qkD-OEu0qyd26h4';

// const oauth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI
// );

// oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Khởi tạo Google Drive API
// const drive = google.drive({ version: 'v3', auth: oauth2Client });
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
async function getFolderIdByName(folderName) {
  try {
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
      fields: 'files(id, name)',
      pageSize: 1, // Điều chỉnh số lượng kết quả trả về nếu cần thiết
    });
    const files = response.data.files;
    if (files.length === 0) {
      console.log(`No folder found with name '${folderName}'`);
      return null;
    }
    return files[0].id; // Trả về folderId của thư mục đầu tiên
  } catch (error) {
    console.error('Error retrieving folder ID:', error);
    throw error;
  }
}


// Hàm để liệt kê các tệp tin ảnh
async function listFiles() {
  try {
    const response = await drive.files.list({
      q: "mimeType contains 'image/'",
      fields: 'files(id, name, mimeType)'
    });
    return response.data.files;
  } catch (error) {
    console.log(error.message);
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
    console.log(response.data.files)
    return response.data.files;
  } catch (error) {
    console.log(error.message);
  }
}

// listFilesByFolder('1TLQpT9-fU2otCm1oVGLLQeTVW6oQpOvX');

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

// Endpoint để liệt kê tất cả các ảnh
app.get('/images', async (req, res) => {
  const files = await listFiles();
  res.json(files);
});

// Endpoint để tải một ảnh cụ thể
app.get('/image/:fileId', async (req, res) => {
  const fileId = req.params.fileId;
  const buffer = await downloadFile(fileId);
  res.setHeader('Content-Type', 'image/jpeg'); // Thay đổi nếu cần thiết
  res.send(buffer);
});

app.get('/collection/id=:folderId', async (req, res) =>{
  const folderId = req.params.folderId;
  
  console.log(folderId)
  const files = await listFilesByFolder(folderId);
  console.log(files)
  res.render('collection.ejs', { files });
});

app.get('/collection/:folderName', async (req, res) => {
  const folderName = decodeURIComponent(req.params.folderName);
  
  try {
    const folderId = await getFolderIdByName(folderName);
    if (!folderId) {
      return res.status(404).send(`Folder with name ${folderName} not found.`);
    }
    const files = await listFilesByFolder(folderId);
    res.render('collection.ejs', { files });
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
  res.render('collection-list.ejs')
});

app.get('/collection', async (req, res) => {
  res.render('collection.ejs')
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

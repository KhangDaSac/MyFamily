const { google } = require('googleapis');
import configViewEngine from '../config/viewEngine';
require('dotenv').config()
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT;

configViewEngine(app);


const CLIENT_ID = '1051455385042-5rhjf6mpbe3jh3rtscoc2ktgmf5i5d6n.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//04Q3vY3FlbQ6_CgYIARAAGAQSNwF-L9IrdbPDTbEVOEXuU_AWnUtwdeKECMlqU1ZEddVCoV4eudPARbuWWNvys0j7-hGGmUqS5nY';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Khởi tạo Google Drive API
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Hàm để liệt kê các tệp tin ảnh
async function listFiles() {
  try {
    const response = await drive.files.list({
      q: "mimeType contains 'image/'",
      fields: 'files(id, name, mimeType)',
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

// Endpoint để liệt kê tất cả các ảnh
app.get('/images', async (req, res) => {
  const files = await listFiles();
  res.json(files);
});

// Endpoint để tải một ảnh cụ thể
app.get('/image/:id', async (req, res) => {
  const fileId = req.params.id;
  const buffer = await downloadFile(fileId);
  res.setHeader('Content-Type', 'image/jpeg'); // Thay đổi nếu cần thiết
  res.send(buffer);
});

app.get('/', async (req, res) => {
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

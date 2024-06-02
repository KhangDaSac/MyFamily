import {google} from "googleapis"

const connectGoogleDrive = (CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN) =>{
    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );
      
      oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
      
      // Khởi tạo Google Drive API
      return google.drive({ version: 'v3', auth: oauth2Client });
}

export default connectGoogleDrive
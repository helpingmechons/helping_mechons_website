import { google } from "googleapis";

function getAuthClient() {
  const base64 = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_BASE64;
  if (!base64) throw new Error("GOOGLE_DRIVE_SERVICE_ACCOUNT_BASE64 not set");
  const json = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
  return new google.auth.GoogleAuth({
    credentials: json,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
}

/**
 * Upload a file buffer to Google Drive.
 * Returns the public shareable URL.
 */
export async function uploadToDrive({ name, mimeType, buffer }) {
  const auth   = getAuthClient();
  const drive  = google.drive({ version: "v3", auth });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const res = await drive.files.create({
    requestBody: {
      name,
      parents: folderId ? [folderId] : [],
    },
    media: {
      mimeType,
      body:   require("stream").Readable.from(buffer),
    },
    fields: "id, webViewLink, webContentLink",
  });

  const fileId = res.data.id;

  // Make the file publicly readable
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  // Return direct-view link
  return {
    fileId,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
    directUrl: `https://drive.google.com/uc?id=${fileId}`,
  };
}

/**
 * Convert a Google Drive file ID to a direct image URL.
 * Works for publicly shared files.
 */
export function driveIdToUrl(fileId) {
  if (!fileId) return null;
  return `https://drive.google.com/uc?id=${fileId}`;
}

/**
 * Extract file ID from a Google Drive share URL.
 */
export function extractDriveId(url) {
  if (!url) return null;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

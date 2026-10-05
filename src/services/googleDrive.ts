export const ROOT_FOLDER_NAME = 'SOTS_Documents';

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSizeFormatted: string;
  fileSizeBytes: number;
  webViewLink: string;
  webContentLink?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileCategoryIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['xls', 'xlsx'].includes(ext)) return 'xls';
  if (['ppt', 'pptx'].includes(ext)) return 'ppt';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  return 'file';
}

export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  // Max size: 15MB
  const MAX_SIZE = 15 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'ขนาดไฟล์เกินกำหนด (สูงสุด 15 MB)' };
  }

  // Allowed extensions
  const allowedExtensions = [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'jpg',
    'jpeg',
    'png',
    'txt',
    'zip',
    'rar'
  ];

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `ประเภทไฟล์ไม่ได้รับอนุญาต (รองรับเฉพาะ PDF, Word, Excel, PowerPoint, รูปภาพ, TXT)`
    };
  }

  return { valid: true };
}

/**
 * Searches for a folder with folderName, optionally within parentId.
 * If not found, creates it.
 */
export async function findOrCreateFolder(
  folderName: string,
  parentId: string | undefined,
  accessToken: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  // 1. Search for folder
  let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(
    /'/g,
    "\\'"
  )}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,webViewLink)&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`ไม่สามารถตรวจสอบโฟลเดอร์ Google Drive ได้: ${errText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0];
  }

  // 2. Not found, create folder
  const createUrl = 'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink';
  const body: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentId) {
    body.parents = [parentId];
  }

  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`ไม่สามารถสร้างโฟลเดอร์ "${folderName}" ใน Google Drive ได้: ${errText}`);
  }

  const createdFolder = await createRes.json();
  return createdFolder;
}

/**
 * Ensures SOTS_Documents root folder and Task specific subfolder exist.
 * e.g., SOTS_Documents / SEC-001
 */
export async function getOrCreateTaskFolder(
  taskId: string,
  accessToken: string
): Promise<{ rootFolderId: string; taskFolderId: string }> {
  // 1. Find or create root folder "SOTS_Documents"
  const root = await findOrCreateFolder(ROOT_FOLDER_NAME, undefined, accessToken);

  // 2. Find or create subfolder taskId under SOTS_Documents
  const taskFolder = await findOrCreateFolder(taskId.trim(), root.id, accessToken);

  return {
    rootFolderId: root.id,
    taskFolderId: taskFolder.id
  };
}

/**
 * Uploads a file to Google Drive under SOTS_Documents / {taskId}
 */
export async function uploadFileToDrive(
  file: File,
  taskId: string,
  accessToken: string
): Promise<DriveUploadResult> {
  // Validate file
  const validation = validateUploadFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get or create task subfolder
  const { taskFolderId } = await getOrCreateTaskFolder(taskId, accessToken);

  // Build Multipart body
  const metadata = {
    name: file.name,
    parents: [taskFolderId]
  };

  const boundary = '-------SOTS_DRIVE_UPLOAD_BOUNDARY_' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;
  const fileHeader = `${delimiter}Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  const fileBuffer = await file.arrayBuffer();

  const multipartBlob = new Blob(
    [metadataPart, fileHeader, fileBuffer, closeDelimiter],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const uploadUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink';

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBlob
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`อัปโหลดไฟล์ไปยัง Google Drive ไม่สำเร็จ: ${errText}`);
  }

  const data = await res.json();
  const sizeNum = data.size ? parseInt(data.size, 10) : file.size;

  return {
    fileId: data.id,
    fileName: data.name,
    mimeType: data.mimeType || file.type || 'application/octet-stream',
    fileSizeBytes: sizeNum,
    fileSizeFormatted: formatFileSize(sizeNum),
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    webContentLink: data.webContentLink
  };
}

/**
 * Deletes a file from Google Drive.
 */
export async function deleteFileFromDrive(fileId: string, accessToken: string): Promise<void> {
  const deleteUrl = `https://www.googleapis.com/drive/v3/files/${fileId}`;

  const res = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok && res.status !== 404) {
    const errText = await res.text();
    throw new Error(`ไม่สามารถลบไฟล์จาก Google Drive ได้: ${errText}`);
  }
}

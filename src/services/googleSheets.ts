import { Task, TaskCategory, TaskPriority, TaskStatus, TaskHistoryItem, TaskDocument } from '../types';

export const SPREADSHEET_NAME = 'SOTS_Database';
export const SHEET_NAME = 'Tasks';
export const SHEET_HISTORY_NAME = 'Task_History';
export const SHEET_DOCUMENTS_NAME = 'Documents';

export const SHEET_HEADERS = [
  'รหัสงาน',
  'วันที่รับเรื่อง',
  'ประเภทงาน',
  'ผู้รับผิดชอบ',
  'กำหนดติดตาม',
  'สถานะ',
  'วันที่ติดตามล่าสุด',
  'วันที่ติดตามครั้งถัดไป',
  'สรุปการดำเนินงาน',
  'หมายเหตุ',
  'สังกัด/หน่วยงาน',
  'ขั้นตอนการทำงาน',
  'ระดับความสำคัญ'
];

export const HISTORY_HEADERS = [
  'วันที่และเวลา',
  'รหัสงาน',
  'สถานะเดิม',
  'สถานะใหม่',
  'ผู้ดำเนินการ',
  'รายละเอียด/หมายเหตุ'
];

export const DOCUMENT_HEADERS = [
  'Document ID',
  'Task ID',
  'File Name',
  'File Type',
  'File Size',
  'Google Drive File ID',
  'Drive URL',
  'Uploaded Date',
  'Uploaded By'
];

/**
 * Ensures Documents sheet exists with proper headers in the spreadsheet.
 */
export async function ensureDocumentsSheet(
  spreadsheetId: string,
  accessToken: string
): Promise<void> {
  try {
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`;
    const metaRes = await fetch(metaUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!metaRes.ok) return;

    const metaData = await metaRes.json();
    const docSheetExists = metaData.sheets?.some(
      (s: any) => s.properties?.title?.toLowerCase() === SHEET_DOCUMENTS_NAME.toLowerCase()
    );

    if (!docSheetExists) {
      // Create Documents sheet
      const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
      await fetch(batchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEET_DOCUMENTS_NAME,
                  gridProperties: {
                    frozenRowCount: 1
                  }
                }
              }
            }
          ]
        })
      });

      // Write Header Row for Documents
      const headerUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        SHEET_DOCUMENTS_NAME
      )}!A1:I1?valueInputOption=USER_ENTERED`;

      await fetch(headerUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [DOCUMENT_HEADERS]
        })
      });
    }
  } catch (e) {
    console.error('ensureDocumentsSheet error:', e);
  }
}

/**
 * Ensures Task_History sheet exists with proper headers in the spreadsheet.
 */
export async function ensureTaskHistorySheet(
  spreadsheetId: string,
  accessToken: string
): Promise<void> {
  try {
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`;
    const metaRes = await fetch(metaUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!metaRes.ok) return;

    const metaData = await metaRes.json();
    const historySheetExists = metaData.sheets?.some(
      (s: any) => s.properties?.title?.toLowerCase() === SHEET_HISTORY_NAME.toLowerCase()
    );

    if (!historySheetExists) {
      // Create Task_History sheet
      const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
      await fetch(batchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEET_HISTORY_NAME,
                  gridProperties: {
                    frozenRowCount: 1
                  }
                }
              }
            }
          ]
        })
      });

      // Write Header Row for Task_History
      const headerUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        SHEET_HISTORY_NAME
      )}!A1:F1?valueInputOption=USER_ENTERED`;

      await fetch(headerUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [HISTORY_HEADERS]
        })
      });
    }
  } catch (e) {
    console.error('ensureTaskHistorySheet error:', e);
  }
}

/**
 * Searches for SOTS_Database in Google Drive. If not found, creates it with Tasks, Task_History, and Documents sheets.
 */
export async function findOrCreateSOTSDatabase(
  accessToken: string
): Promise<{ spreadsheetId: string; isNew: boolean; webViewLink?: string }> {
  // 1. Search for existing file
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(
    SPREADSHEET_NAME
  )}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name,webViewLink)&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(`ไม่สามารถค้นหาไฟล์ใน Google Drive ได้: ${errorText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    const existingFile = searchData.files[0];
    await ensureTaskHistorySheet(existingFile.id, accessToken);
    await ensureDocumentsSheet(existingFile.id, accessToken);
    return { spreadsheetId: existingFile.id, isNew: false, webViewLink: existingFile.webViewLink };
  }

  // 2. File does not exist, create new spreadsheet with Tasks, Task_History, and Documents
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_NAME
      },
      sheets: [
        {
          properties: {
            title: SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1
            }
          }
        },
        {
          properties: {
            title: SHEET_HISTORY_NAME,
            gridProperties: {
              frozenRowCount: 1
            }
          }
        },
        {
          properties: {
            title: SHEET_DOCUMENTS_NAME,
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`ไม่สามารถสร้างสเปรดชีต SOTS_Database ได้: ${errText}`);
  }

  const createData = await createRes.json();
  const newSpreadsheetId = createData.spreadsheetId;

  // 3. Write Header Rows
  const headerTasksUrl = `https://sheets.googleapis.com/v4/spreadsheets/${newSpreadsheetId}/values/${encodeURIComponent(
    SHEET_NAME
  )}!A1:M1?valueInputOption=USER_ENTERED`;

  await fetch(headerTasksUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [SHEET_HEADERS]
    })
  });

  const headerHistoryUrl = `https://sheets.googleapis.com/v4/spreadsheets/${newSpreadsheetId}/values/${encodeURIComponent(
    SHEET_HISTORY_NAME
  )}!A1:F1?valueInputOption=USER_ENTERED`;

  await fetch(headerHistoryUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [HISTORY_HEADERS]
    })
  });

  const headerDocsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${newSpreadsheetId}/values/${encodeURIComponent(
    SHEET_DOCUMENTS_NAME
  )}!A1:I1?valueInputOption=USER_ENTERED`;

  await fetch(headerDocsUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [DOCUMENT_HEADERS]
    })
  });

  return {
    spreadsheetId: newSpreadsheetId,
    isNew: true,
    webViewLink: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`
  };
}

/**
 * Reads all tasks from Tasks sheet.
 */
export async function fetchTasksFromSheet(
  spreadsheetId: string,
  accessToken: string
): Promise<Task[]> {
  const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_NAME
  )}!A2:M?valueRenderOption=FORMATTED_VALUE`;

  const res = await fetch(readUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ไม่สามารถอ่านข้อมูลจาก Sheet Tasks ได้: ${errText}`);
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  const tasks: Task[] = [];

  rows.forEach((row, idx) => {
    const id = row[0] ? String(row[0]).trim() : '';
    if (!id) return; // Skip blank rows

    const receivedDate = row[1] ? String(row[1]).trim() : '';
    const category = (row[2] ? String(row[2]).trim() : 'งานประสานงาน') as TaskCategory;
    const assignee = row[3] ? String(row[3]).trim() : '';
    const deadline = row[4] ? String(row[4]).trim() : '';
    const status = (row[5] ? String(row[5]).trim() : 'รอดำเนินการ') as TaskStatus;
    const lastTrackedDate = row[6] ? String(row[6]).trim() : receivedDate;
    const nextTrackingDate = row[7] ? String(row[7]).trim() : deadline;
    const summary = row[8] ? String(row[8]).trim() : '';
    const notes = row[9] ? String(row[9]).trim() : '';
    const department = row[10]
      ? String(row[10]).trim()
      : 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา';

    let workflowStep: 1 | 2 | 3 | 4 | 5 = 1;
    if (row[11]) {
      const stepNum = parseInt(String(row[11]).replace(/\D/g, ''), 10);
      if (stepNum >= 1 && stepNum <= 5) {
        workflowStep = stepNum as any;
      }
    } else {
      if (status === 'เสร็จสิ้น') workflowStep = 5;
      else if (status === 'รอติดตาม') workflowStep = 4;
      else if (status === 'อยู่ระหว่างดำเนินการ') workflowStep = 3;
      else workflowStep = 1;
    }

    const priority = (row[12] ? String(row[12]).trim() : 'ปกติ') as TaskPriority;

    tasks.push({
      id,
      receivedDate,
      category,
      assignee,
      department,
      deadline,
      status,
      lastTrackedDate,
      nextTrackingDate,
      summary,
      notes,
      workflowStep,
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  return tasks;
}

/**
 * Appends a new task row to the Tasks sheet.
 */
export async function appendTaskToSheet(
  spreadsheetId: string,
  task: Task,
  accessToken: string
): Promise<void> {
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_NAME
  )}!A:M:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const rowValues = [
    task.id,
    task.receivedDate,
    task.category,
    task.assignee,
    task.deadline,
    task.status,
    task.lastTrackedDate,
    task.nextTrackingDate,
    task.summary,
    task.notes,
    task.department,
    `ขั้นที่ ${task.workflowStep}`,
    task.priority
  ];

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ไม่สามารถเพิ่มรายการลงใน Google Sheets ได้: ${errText}`);
  }
}

/**
 * Updates an existing task row by locating its taskId in Column A.
 */
export async function updateTaskInSheet(
  spreadsheetId: string,
  task: Task,
  accessToken: string
): Promise<void> {
  // 1. Fetch column A to find row index
  const colAUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_NAME
  )}!A:A`;

  const colRes = await fetch(colAUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!colRes.ok) {
    const errText = await colRes.text();
    throw new Error(`ไม่สามารถตรวจสอบแถวของงานใน Google Sheets ได้: ${errText}`);
  }

  const colData = await colRes.json();
  const rows: string[][] = colData.values || [];

  let targetRowIndex = -1;
  const targetId = task.id.trim().toUpperCase();

  for (let i = 0; i < rows.length; i++) {
    const val = rows[i][0] ? String(rows[i][0]).trim().toUpperCase() : '';
    if (val === targetId) {
      targetRowIndex = i + 1; // 1-based row number
      break;
    }
  }

  const rowValues = [
    task.id,
    task.receivedDate,
    task.category,
    task.assignee,
    task.deadline,
    task.status,
    task.lastTrackedDate,
    task.nextTrackingDate,
    task.summary,
    task.notes,
    task.department,
    `ขั้นที่ ${task.workflowStep}`,
    task.priority
  ];

  if (targetRowIndex === -1) {
    // If not found in existing rows, append it instead of failing
    await appendTaskToSheet(spreadsheetId, task, accessToken);
    return;
  }

  // 2. Overwrite the exact row
  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_NAME
  )}!A${targetRowIndex}:M${targetRowIndex}?valueInputOption=USER_ENTERED`;

  const updateRes = await fetch(updateUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`ไม่สามารถอัปเดตแถวข้อมูลใน Google Sheets ได้: ${errText}`);
  }
}

/**
 * Deletes a row matching taskId using Google Sheets batchUpdate deleteDimension.
 */
export async function deleteTaskFromSheet(
  spreadsheetId: string,
  taskId: string,
  accessToken: string
): Promise<void> {
  // 1. Get sheetId of Tasks
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`;
  const metaRes = await fetch(metaUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!metaRes.ok) {
    const err = await metaRes.text();
    throw new Error(`ไม่สามารถอ่านโครงสร้าง Sheet เพื่อลบข้อมูลได้: ${err}`);
  }

  const metaData = await metaRes.json();
  const taskSheet = metaData.sheets?.find(
    (s: any) => s.properties?.title?.toLowerCase() === SHEET_NAME.toLowerCase()
  );

  if (!taskSheet) {
    throw new Error(`ไม่พบ Sheet ชื่อ '${SHEET_NAME}' ใน Google Sheets`);
  }

  const numericSheetId = taskSheet.properties.sheetId;

  // 2. Find row index of taskId
  const colAUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_NAME
  )}!A:A`;

  const colRes = await fetch(colAUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const colData = await colRes.json();
  const rows: string[][] = colData.values || [];

  let zeroBasedIndex = -1;
  const targetId = taskId.trim().toUpperCase();

  for (let i = 0; i < rows.length; i++) {
    const val = rows[i][0] ? String(rows[i][0]).trim().toUpperCase() : '';
    if (val === targetId) {
      zeroBasedIndex = i; // 0-based
      break;
    }
  }

  if (zeroBasedIndex === -1) {
    // Row not found in sheet, nothing to delete in Sheet
    return;
  }

  // 3. Delete Dimension Request
  const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  const deleteRes = await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: numericSheetId,
              dimension: 'ROWS',
              startIndex: zeroBasedIndex,
              endIndex: zeroBasedIndex + 1
            }
          }
        }
      ]
    })
  });

  if (!deleteRes.ok) {
    const errText = await deleteRes.text();
    throw new Error(`ไม่สามารถลบแถวข้อมูลใน Google Sheets ได้: ${errText}`);
  }
}

/**
 * Populates initial demo tasks into a newly created sheet.
 */
export async function seedInitialTasksToSheet(
  spreadsheetId: string,
  initialTasks: Task[],
  accessToken: string
): Promise<void> {
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_NAME
  )}!A2:M:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const rows = initialTasks.map((task) => [
    task.id,
    task.receivedDate,
    task.category,
    task.assignee,
    task.deadline,
    task.status,
    task.lastTrackedDate,
    task.nextTrackingDate,
    task.summary,
    task.notes,
    task.department,
    `ขั้นที่ ${task.workflowStep}`,
    task.priority
  ]);

  await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: rows
    })
  });
}

/**
 * Reads all history items from Task_History sheet.
 */
export async function fetchHistoryFromSheet(
  spreadsheetId: string,
  accessToken: string
): Promise<TaskHistoryItem[]> {
  const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_HISTORY_NAME
  )}!A2:F?valueRenderOption=FORMATTED_VALUE`;

  const res = await fetch(readUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ไม่สามารถอ่านข้อมูลจาก Sheet Task_History ได้: ${errText}`);
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  const historyItems: TaskHistoryItem[] = [];

  rows.forEach((row, idx) => {
    const timestamp = row[0] ? String(row[0]).trim() : '';
    const taskId = row[1] ? String(row[1]).trim() : '';
    if (!taskId) return; // skip empty

    const previousStatus = row[2] ? String(row[2]).trim() : '-';
    const newStatus = row[3] ? String(row[3]).trim() : '-';
    const operator = row[4] ? String(row[4]).trim() : 'เจ้าหน้าที่';
    const details = row[5] ? String(row[5]).trim() : '-';

    historyItems.push({
      id: `HIST-${String(idx + 1).padStart(3, '0')}`,
      timestamp,
      taskId,
      previousStatus,
      newStatus,
      operator,
      details
    });
  });

  // Sort descending by timestamp / newest first
  return historyItems.reverse();
}

/**
 * Appends a history record to Task_History sheet.
 */
export async function appendHistoryToSheet(
  spreadsheetId: string,
  historyItem: TaskHistoryItem,
  accessToken: string
): Promise<void> {
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_HISTORY_NAME
  )}!A:F:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const rowValues = [
    historyItem.timestamp,
    historyItem.taskId,
    historyItem.previousStatus,
    historyItem.newStatus,
    historyItem.operator,
    historyItem.details
  ];

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('appendHistoryToSheet error:', errText);
  }
}

/**
 * Populates initial history items into newly created Task_History sheet.
 */
export async function seedInitialHistoryToSheet(
  spreadsheetId: string,
  historyItems: TaskHistoryItem[],
  accessToken: string
): Promise<void> {
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_HISTORY_NAME
  )}!A2:F:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const rows = historyItems.map((h) => [
    h.timestamp,
    h.taskId,
    h.previousStatus,
    h.newStatus,
    h.operator,
    h.details
  ]);

  await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: rows
    })
  });
}

/**
 * Reads all documents from Documents sheet.
 */
export async function fetchDocumentsFromSheet(
  spreadsheetId: string,
  accessToken: string
): Promise<TaskDocument[]> {
  const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_DOCUMENTS_NAME
  )}!A2:I?valueRenderOption=FORMATTED_VALUE`;

  const res = await fetch(readUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ไม่สามารถอ่านข้อมูลจาก Sheet Documents ได้: ${errText}`);
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  const docs: TaskDocument[] = [];

  rows.forEach((row) => {
    const id = row[0] ? String(row[0]).trim() : '';
    const taskId = row[1] ? String(row[1]).trim() : '';
    if (!id || !taskId) return;

    const fileName = row[2] ? String(row[2]).trim() : 'เอกสาร';
    const fileType = row[3] ? String(row[3]).trim() : 'application/octet-stream';
    const fileSize = row[4] ? String(row[4]).trim() : '0 B';
    const driveFileId = row[5] ? String(row[5]).trim() : '';
    const driveUrl = row[6] ? String(row[6]).trim() : '';
    const uploadedDate = row[7] ? String(row[7]).trim() : '';
    const uploadedBy = row[8] ? String(row[8]).trim() : 'เจ้าหน้าที่';

    docs.push({
      id,
      taskId,
      fileName,
      fileType,
      fileSize,
      driveFileId,
      driveUrl,
      uploadedDate,
      uploadedBy
    });
  });

  return docs;
}

/**
 * Appends a document record to Documents sheet.
 */
export async function appendDocumentToSheet(
  spreadsheetId: string,
  doc: TaskDocument,
  accessToken: string
): Promise<void> {
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_DOCUMENTS_NAME
  )}!A:I:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const rowValues = [
    doc.id,
    doc.taskId,
    doc.fileName,
    doc.fileType,
    doc.fileSize,
    doc.driveFileId,
    doc.driveUrl,
    doc.uploadedDate,
    doc.uploadedBy
  ];

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('appendDocumentToSheet error:', errText);
    throw new Error(`ไม่สามารถบันทึกข้อมูลเอกสารลง Google Sheets: ${errText}`);
  }
}

/**
 * Deletes a row matching docId from Documents sheet.
 */
export async function deleteDocumentFromSheet(
  spreadsheetId: string,
  docId: string,
  accessToken: string
): Promise<void> {
  // 1. Get sheetId of Documents sheet
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`;
  const metaRes = await fetch(metaUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!metaRes.ok) return;

  const metaData = await metaRes.json();
  const docSheet = metaData.sheets?.find(
    (s: any) => s.properties?.title?.toLowerCase() === SHEET_DOCUMENTS_NAME.toLowerCase()
  );

  if (!docSheet) return;
  const numericSheetId = docSheet.properties.sheetId;

  // 2. Find row index of docId in Column A
  const colAUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_DOCUMENTS_NAME
  )}!A:A`;

  const colRes = await fetch(colAUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!colRes.ok) return;

  const colData = await colRes.json();
  const rows: string[][] = colData.values || [];

  let zeroBasedIndex = -1;
  const targetId = docId.trim().toUpperCase();

  for (let i = 0; i < rows.length; i++) {
    const val = rows[i][0] ? String(rows[i][0]).trim().toUpperCase() : '';
    if (val === targetId) {
      zeroBasedIndex = i;
      break;
    }
  }

  if (zeroBasedIndex === -1) return;

  // 3. Delete row
  const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: numericSheetId,
              dimension: 'ROWS',
              startIndex: zeroBasedIndex,
              endIndex: zeroBasedIndex + 1
            }
          }
        }
      ]
    })
  });
}

/**
 * Populates initial documents into newly created Documents sheet.
 */
export async function seedInitialDocumentsToSheet(
  spreadsheetId: string,
  initialDocs: TaskDocument[],
  accessToken: string
): Promise<void> {
  if (initialDocs.length === 0) return;

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    SHEET_DOCUMENTS_NAME
  )}!A2:I:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const rows = initialDocs.map((doc) => [
    doc.id,
    doc.taskId,
    doc.fileName,
    doc.fileType,
    doc.fileSize,
    doc.driveFileId,
    doc.driveUrl,
    doc.uploadedDate,
    doc.uploadedBy
  ]);

  await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: rows
    })
  });
}



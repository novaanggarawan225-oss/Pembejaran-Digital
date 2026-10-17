/**
 * Google Apps Script Code template for Google Sheets Backend
 * KELAS DIGITAL - Sistem Manajemen Pembelajaran Terintegrasi
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================================
 * KELAS DIGITAL - Google Apps Script Backend API
 * Web App Endpoint for Google Sheets Database
 * ============================================================================
 * 
 * CARA MEMASANG:
 * 1. Buka Google Sheets baru di https://sheets.new
 * 2. Beri nama spreadsheet: "KELAS DIGITAL DATABASE"
 * 3. Klik menu: Ekstensi > Apps Script (Extensions > Apps Script)
 * 4. Hapus semua kode default di Code.gs, lalu paste seluruh isi file ini
 * 5. Jalankan fungsi "initDatabase()" satu kali untuk membuat 15 sheet otomatis
 * 6. Klik tombol "Deploy" > "New deployment" (Terapkan > Kelola penerapan)
 * 7. Pilih jenis: "Web app"
 *    - Description: "KELAS DIGITAL API v1.0"
 *    - Execute as: "Me (email Anda)"
 *    - Who has access: "Anyone" (Siapa saja)
 * 8. Klik "Deploy", izinkan akses permissions Google Account Anda
 * 9. Salin "Web app URL" (format: https://script.google.com/macros/s/.../exec)
 * 10. Masukkan URL tersebut ke menu Pengaturan Akun > Integrasi Google Sheets di web KELAS DIGITAL
 */

const SHEET_NAMES = [
  'Users',
  'Classes',
  'ClassMembers',
  'Materials',
  'Assignments',
  'Submissions',
  'PeerAssessments',
  'PeerAssessmentAssignments',
  'FormativeAssessments',
  'FormativeResponses',
  'Reflections',
  'LeaveRequests',
  'Notifications',
  'AuditLogs',
  'Settings'
];

const SHEET_HEADERS = {
  Users: ['user_id', 'nama', 'email', 'username', 'password_hash_atau_identitas_provider', 'role', 'status_akun', 'created_at', 'avatar_url', 'nisn_nip', 'no_telepon'],
  Classes: ['class_id', 'nama_kelas', 'mata_pelajaran', 'deskripsi', 'teacher_id', 'kode_kelas', 'status', 'created_at', 'cover_gradient', 'tingkat', 'tahun_ajaran'],
  ClassMembers: ['membership_id', 'class_id', 'student_id', 'tanggal_bergabung', 'status'],
  Materials: ['material_id', 'class_id', 'teacher_id', 'judul', 'deskripsi', 'isi_materi', 'attachment_url', 'video_url', 'status', 'published_at', 'created_at', 'file_name', 'file_type'],
  Assignments: ['assignment_id', 'class_id', 'teacher_id', 'judul', 'instruksi', 'jenis_jawaban', 'nilai_maksimum', 'tanggal_mulai', 'tenggat', 'status', 'created_at', 'attachment_url'],
  Submissions: ['submission_id', 'assignment_id', 'student_id', 'jawaban_teks', 'jawaban_url', 'attachment_url', 'attachment_name', 'submitted_at', 'status', 'nilai', 'feedback', 'graded_by', 'graded_at'],
  PeerAssessments: ['assessment_id', 'class_id', 'teacher_id', 'judul', 'instruksi', 'rubrik_json', 'tenggat', 'status', 'created_at', 'is_anonymous'],
  PeerAssessmentAssignments: ['peer_assignment_id', 'assessment_id', 'evaluator_id', 'evaluated_student_id', 'jawaban_rubrik_json', 'komentar', 'total_skor', 'submitted_at', 'status'],
  FormativeAssessments: ['formative_id', 'class_id', 'teacher_id', 'judul', 'instruksi', 'questions_json', 'settings_json', 'tanggal_mulai', 'tenggat', 'status', 'created_at'],
  FormativeResponses: ['response_id', 'formative_id', 'student_id', 'answers_json', 'nilai_otomatis', 'nilai_manual', 'total_nilai', 'feedback', 'submitted_at', 'status', 'graded_by', 'graded_at'],
  Reflections: ['reflection_id', 'class_id', 'material_id', 'student_id', 'questions_json', 'answers_json', 'submitted_at', 'status', 'teacher_notes', 'needs_attention'],
  LeaveRequests: ['leave_id', 'student_id', 'class_id', 'jenis_izin', 'tanggal_pengajuan', 'tanggal_mulai', 'tanggal_selesai', 'alasan', 'attachment_url', 'status', 'keputusan_guru_id', 'catatan_guru', 'decided_at', 'updated_at'],
  Notifications: ['notification_id', 'user_id', 'judul', 'pesan', 'jenis', 'related_id', 'is_read', 'created_at'],
  AuditLogs: ['log_id', 'actor_id', 'actor_name', 'action', 'entity_type', 'entity_id', 'timestamp', 'result', 'details'],
  Settings: ['setting_key', 'setting_value', 'updated_at']
};

/**
 * Inisialisasi seluruh 15 Sheet dan Header otomatis
 */
function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEET_NAMES.forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    const headers = SHEET_HEADERS[name];
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#E2E8F0');
      sheet.setFrozenRows(1);
    }
  });
  
  // Hapus Sheet1 jika ada
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Lembar1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }
  
  Logger.log('Inisialisasi 15 Sheet Berhasil!');
}

/**
 * Endpoint HTTP GET
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  
  if (action === 'ping') {
    return jsonResponse({
      status: 'success',
      message: 'KELAS DIGITAL Apps Script API is active & ready',
      time: new Date().toISOString(),
      sheets: SHEET_NAMES
    });
  }
  
  if (action === 'fetchAll') {
    return handleFetchAll();
  }
  
  if (action === 'fetchTable') {
    const tableName = e.parameter.table;
    return handleFetchTable(tableName);
  }
  
  return jsonResponse({ status: 'error', message: 'Action not supported: ' + action });
}

/**
 * Endpoint HTTP POST
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Tunggu lock hingga 10 detik untuk menghindari konflik baris
    lock.waitLock(10000);
    
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    
    const action = payload.action;
    
    if (action === 'init') {
      initDatabase();
      return jsonResponse({ status: 'success', message: 'Database initialized successfully' });
    }
    
    if (action === 'syncAll') {
      return handleSyncAll(payload.data);
    }
    
    if (action === 'upsertRow') {
      return handleUpsertRow(payload.table, payload.primaryKey, payload.row);
    }
    
    if (action === 'deleteRow') {
      return handleDeleteRow(payload.table, payload.primaryKey, payload.keyValue);
    }
    
    return jsonResponse({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function handleFetchAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {};
  
  SHEET_NAMES.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) {
      result[name] = [];
      return;
    }
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      result[name] = [];
      return;
    }
    const headers = data[0];
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const row = {};
      let hasData = false;
      for (let j = 0; j < headers.length; j++) {
        let val = data[i][j];
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try { val = JSON.parse(val); } catch(e) {}
        }
        row[headers[j]] = val;
        if (val !== '' && val !== null) hasData = true;
      }
      if (hasData) rows.push(row);
    }
    result[name] = rows;
  });
  
  return jsonResponse({ status: 'success', data: result });
}

function handleFetchTable(tableName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tableName);
  if (!sheet) return jsonResponse({ status: 'error', message: 'Sheet not found: ' + tableName });
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonResponse({ status: 'success', data: [] });
  
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      let val = data[i][j];
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { val = JSON.parse(val); } catch(e) {}
      }
      row[headers[j]] = val;
    }
    rows.push(row);
  }
  return jsonResponse({ status: 'success', data: rows });
}

function handleUpsertRow(tableName, primaryKey, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(tableName);
  if (!sheet) {
    initDatabase();
    sheet = ss.getSheetByName(tableName);
  }
  
  const headers = SHEET_HEADERS[tableName] || [];
  const primaryVal = rowData[primaryKey];
  const allData = sheet.getDataRange().getValues();
  
  const pkIndex = headers.indexOf(primaryKey);
  let targetRowIndex = -1;
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][pkIndex]) === String(primaryVal)) {
      targetRowIndex = i + 1; // 1-indexed in sheet
      break;
    }
  }
  
  const formattedRow = headers.map(h => {
    const val = rowData[h];
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    return val === undefined ? '' : val;
  });
  
  if (targetRowIndex > 0) {
    // Update existing row
    sheet.getRange(targetRowIndex, 1, 1, formattedRow.length).setValues([formattedRow]);
  } else {
    // Append new row
    sheet.appendRow(formattedRow);
  }
  
  return jsonResponse({ status: 'success', message: 'Row saved', primaryKey: primaryVal });
}

function handleDeleteRow(tableName, primaryKey, keyValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tableName);
  if (!sheet) return jsonResponse({ status: 'error', message: 'Sheet not found' });
  
  const headers = SHEET_HEADERS[tableName] || [];
  const pkIndex = headers.indexOf(primaryKey);
  const allData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][pkIndex]) === String(keyValue)) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ status: 'success', message: 'Row deleted' });
    }
  }
  return jsonResponse({ status: 'not_found', message: 'Record not found' });
}

function handleSyncAll(fullState) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Object.keys(fullState).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    const headers = SHEET_HEADERS[name] || Object.keys(fullState[name][0] || {});
    if (headers.length === 0) return;
    
    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#E2E8F0');
    
    const records = fullState[name] || [];
    if (records.length > 0) {
      const rows = records.map(item => {
        return headers.map(h => {
          const val = item[h];
          if (typeof val === 'object' && val !== null) {
            return JSON.stringify(val);
          }
          return val === undefined ? '' : val;
        });
      });
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
  });
  
  return jsonResponse({ status: 'success', message: 'Full sync completed successfully', timestamp: new Date().toISOString() });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

import {
  User,
  ClassRoom,
  ClassMember,
  Material,
  Assignment,
  Submission,
  PeerAssessment,
  PeerAssessmentAssignment,
  FormativeAssessment,
  FormativeResponse,
  Reflection,
  LeaveRequest,
  NotificationItem,
  AuditLog,
  AppSettings,
  GoogleSheetsConfig
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_MEMBERS,
  INITIAL_MATERIALS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_PEER_ASSESSMENTS,
  INITIAL_PEER_ASSIGNMENTS,
  INITIAL_FORMATIVE_ASSESSMENTS,
  INITIAL_FORMATIVE_RESPONSES,
  INITIAL_REFLECTIONS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS
} from '../data/initialData';

export interface FullAppState {
  Users: User[];
  Classes: ClassRoom[];
  ClassMembers: ClassMember[];
  Materials: Material[];
  Assignments: Assignment[];
  Submissions: Submission[];
  PeerAssessments: PeerAssessment[];
  PeerAssessmentAssignments: PeerAssessmentAssignment[];
  FormativeAssessments: FormativeAssessment[];
  FormativeResponses: FormativeResponse[];
  Reflections: Reflection[];
  LeaveRequests: LeaveRequest[];
  Notifications: NotificationItem[];
  AuditLogs: AuditLog[];
  Settings: AppSettings[];
}

const STORAGE_KEY = 'kd_full_state_v1';
const CONFIG_KEY = 'kd_gas_config_v1';

export function loadStoredConfig(): GoogleSheetsConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading GAS config', e);
  }
  return {
    webAppUrl: '',
    isConnected: false,
    isDemoMode: true
  };
}

export function saveStoredConfig(config: GoogleSheetsConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function loadStoredState(): FullAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all 15 tables exist
      return {
        Users: parsed.Users || INITIAL_USERS,
        Classes: parsed.Classes || INITIAL_CLASSES,
        ClassMembers: parsed.ClassMembers || INITIAL_MEMBERS,
        Materials: parsed.Materials || INITIAL_MATERIALS,
        Assignments: parsed.Assignments || INITIAL_ASSIGNMENTS,
        Submissions: parsed.Submissions || INITIAL_SUBMISSIONS,
        PeerAssessments: parsed.PeerAssessments || INITIAL_PEER_ASSESSMENTS,
        PeerAssessmentAssignments: parsed.PeerAssessmentAssignments || INITIAL_PEER_ASSIGNMENTS,
        FormativeAssessments: parsed.FormativeAssessments || INITIAL_FORMATIVE_ASSESSMENTS,
        FormativeResponses: parsed.FormativeResponses || INITIAL_FORMATIVE_RESPONSES,
        Reflections: parsed.Reflections || INITIAL_REFLECTIONS,
        LeaveRequests: parsed.LeaveRequests || INITIAL_LEAVE_REQUESTS,
        Notifications: parsed.Notifications || INITIAL_NOTIFICATIONS,
        AuditLogs: parsed.AuditLogs || INITIAL_AUDIT_LOGS,
        Settings: parsed.Settings || INITIAL_SETTINGS
      };
    }
  } catch (e) {
    console.error('Error reading local state, falling back to initial data', e);
  }

  // First time initialization
  const initial: FullAppState = {
    Users: INITIAL_USERS,
    Classes: INITIAL_CLASSES,
    ClassMembers: INITIAL_MEMBERS,
    Materials: INITIAL_MATERIALS,
    Assignments: INITIAL_ASSIGNMENTS,
    Submissions: INITIAL_SUBMISSIONS,
    PeerAssessments: INITIAL_PEER_ASSESSMENTS,
    PeerAssessmentAssignments: INITIAL_PEER_ASSIGNMENTS,
    FormativeAssessments: INITIAL_FORMATIVE_ASSESSMENTS,
    FormativeResponses: INITIAL_FORMATIVE_RESPONSES,
    Reflections: INITIAL_REFLECTIONS,
    LeaveRequests: INITIAL_LEAVE_REQUESTS,
    Notifications: INITIAL_NOTIFICATIONS,
    AuditLogs: INITIAL_AUDIT_LOGS,
    Settings: INITIAL_SETTINGS
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveStoredState(state: FullAppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

/**
 * Test Google Apps Script Web App URL
 */
export async function testGasConnection(url: string): Promise<{ success: boolean; message: string; data?: any }> {
  if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Format URL salah! URL harus diawali https://script.google.com/macros/s/.../exec'
    };
  }

  try {
    const pingUrl = `${url}${url.includes('?') ? '&' : '?'}action=ping`;
    const res = await fetch(pingUrl, {
      method: 'GET',
      mode: 'cors'
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Server merespons status ${res.status}: ${res.statusText}. Pastikan deployment diset 'Anyone'.`
      };
    }

    const data = await res.json();
    if (data.status === 'success') {
      return {
        success: true,
        message: 'Koneksi ke Google Sheets & Apps Script berhasil terhubung!',
        data
      };
    } else {
      return {
        success: false,
        message: data.message || 'Respons tidak valid dari Apps Script.'
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungi endpoint: ${err.message || 'CORS / Izin deployment ditolak'}. Pastikan Apps Script di-deploy dengan opsi "Execute as: Me" dan "Who has access: Anyone".`
    };
  }
}

/**
 * Push entire state to Google Sheets via Apps Script Web App
 */
export async function pushStateToGoogleSheets(url: string, state: FullAppState): Promise<{ success: boolean; message: string }> {
  if (!url) {
    return { success: false, message: 'URL Apps Script belum diisi.' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // avoids preflight OPTIONS issues in Apps Script
      },
      body: JSON.stringify({
        action: 'syncAll',
        data: state
      })
    });

    const data = await res.json();
    if (data.status === 'success') {
      return { success: true, message: 'Seluruh 15 worksheet berhasil disinkronkan ke Google Sheets!' };
    }
    return { success: false, message: data.message || 'Gagal sinkronisasi data.' };
  } catch (err: any) {
    return {
      success: false,
      message: `Error pengiriman: ${err.message || 'Gagal terhubung ke Google Sheets'}`
    };
  }
}

/**
 * Fetch all data from Google Sheets
 */
export async function pullStateFromGoogleSheets(url: string): Promise<{ success: boolean; message: string; state?: FullAppState }> {
  if (!url) {
    return { success: false, message: 'URL Apps Script belum diisi.' };
  }

  try {
    const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}action=fetchAll`;
    const res = await fetch(fetchUrl);
    const data = await res.json();
    if (data.status === 'success' && data.data) {
      return {
        success: true,
        message: 'Berhasil mengunduh data terbaru dari Google Sheets.',
        state: data.data as FullAppState
      };
    }
    return { success: false, message: data.message || 'Data tidak ditemukan.' };
  } catch (err: any) {
    return { success: false, message: `Error sinkronisasi: ${err.message}` };
  }
}

/**
 * Convert an array of objects to CSV formatted string
 */
export function exportToCsv(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(h => {
      const val = row[h];
      const str = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

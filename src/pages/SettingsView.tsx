import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/gasScriptTemplate';
import { 
  Settings as SettingsIcon, 
  User, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  FileText,
  RotateCcw,
  ExternalLink,
  Layers,
  Calendar
} from 'lucide-react';

interface SettingsViewProps {
  onOpenSheetsModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenSheetsModal }) => {
  const { currentUser, role } = useAuth();
  const { config, updateConfig, state, testConnection, syncToSheets, pullFromSheets, resetToDefault } = useData();

  const [urlInput, setUrlInput] = useState(config.webAppUrl || '');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setStatusMsg(null);
    const res = await testConnection(urlInput);
    setTesting(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      updateConfig({ webAppUrl: urlInput, isConnected: true, isDemoMode: false });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleSyncPush = async () => {
    setSyncing(true);
    setStatusMsg(null);
    const res = await syncToSheets();
    setSyncing(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke data contoh bawaan? Semua perubahan lokal akan dikembalikan ke data awal.')) {
      resetToDefault();
      setStatusMsg({ type: 'success', text: 'Data berhasil direset ke status demo awal.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Pengaturan Akun &amp; Integrasi Google Sheets
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola profil pengguna, konfigurasi koneksi Google Apps Script Web App, dan kelola database 15 lembar kerja.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Academic Config (1 col) */}
        <div className="space-y-6">
          {/* User Profile */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <User className="w-4 h-4 text-blue-600" />
              <span>Profil Pengguna Aktif</span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white ${
                role === 'GURU' ? 'bg-indigo-600' : 'bg-teal-600'
              }`}>
                {currentUser?.nama.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-slate-900 text-sm truncate">{currentUser?.nama}</div>
                <div className="text-xs text-slate-500 truncate">{currentUser?.email}</div>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  role === 'GURU' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'
                }`}>
                  {role === 'GURU' ? 'GURU / PENDIDIK' : 'MURID / SISWA'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">NIP / NISN:</span>
                <span className="font-mono font-medium">{currentUser?.nisn_nip || '-'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Username:</span>
                <span className="font-mono font-medium">@{currentUser?.username}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Status Akun:</span>
                <span className="text-emerald-700 font-semibold capitalize">{currentUser?.status_akun}</span>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Calendar className="w-4 h-4 text-slate-700" />
              <span>Tahun Ajaran &amp; Lembaga</span>
            </div>
            <div className="space-y-2 pt-1 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Sekolah:</span>
                <span className="font-semibold text-slate-900">SMP Negeri 1 Digital Nusantara</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tahun Ajaran:</span>
                <span className="font-semibold text-slate-900">2025/2026 Genap</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Zona Waktu:</span>
                <span className="font-semibold text-slate-900">Asia/Jakarta (WIB)</span>
              </div>
            </div>
          </div>

          {/* Reset Demo Data Action */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-800">Kembalikan Data Contoh</div>
            <p className="text-slate-500">
              Gunakan opsi ini jika Anda ingin mengembalikan seluruh data simulasi ke keadaan awal mula.
            </p>
            <button
              onClick={handleReset}
              className="mt-2 w-full px-3 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Lokal</span>
            </button>
          </div>
        </div>

        {/* Right Column: Google Sheets & Apps Script Integration Center (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Sheets Configuration Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Koneksi Google Sheets Web App</h2>
                  <p className="text-xs text-slate-500">Database terstruktur 15 lembar kerja dengan LockService</p>
                </div>
              </div>

              <button
                onClick={onOpenSheetsModal}
                className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                <span>Buka Panduan Lengkap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Connection Status Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
              config.isConnected 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {config.isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-bold text-sm block mb-0.5">
                  {config.isConnected
                    ? 'Terhubung: Google Sheets Live API Aktif'
                    : 'Penyimpanan Lokal (Mode Demo Siap Digunakan)'}
                </span>
                <p>
                  {config.isConnected
                    ? `Setiap mutasi data tersimpan di Google Spreadsheet Anda. Terakhir sinkronisasi: ${config.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleString('id-ID') : 'Baru saja'}.`
                    : 'Aplikasi saat ini berjalan menggunakan penyimpanan lokal browser (localStorage). Untuk menghubungkan ke Google Sheets pribadi Anda, masukkan Web App URL di bawah lalu tekan Uji Koneksi.'}
                </p>
              </div>
            </div>

            {statusMsg && (
              <div className={`p-3 text-xs rounded-lg font-medium flex items-center gap-2 ${
                statusMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
              }`}>
                {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Web App URL input */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Google Apps Script Web App Deployment URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfyc.../exec"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                />
                <button
                  onClick={handleTest}
                  disabled={testing || !urlInput}
                  className="px-4 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Uji Koneksi</span>
                </button>
              </div>
            </div>

            {/* Sync push/pull */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSyncPush}
                disabled={syncing || !urlInput}
                className="px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-700 ${syncing ? 'animate-spin' : ''}`} />
                <span>Kirim Semua Data ke Sheets (Push)</span>
              </button>

              <button
                onClick={handleCopyCode}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Kode Skrip Tersalin!' : 'Salin Kode Code.gs'}</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Preview */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Catatan Aktivitas Sistem (Audit Logs)</span>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {state.AuditLogs.length} rekaman log
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto text-xs">
              {state.AuditLogs.map(log => (
                <div key={log.log_id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span>{log.actor_name}</span>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/gasScriptTemplate';
import { exportToCsv } from '../services/api';
import { 
  X, 
  Copy, 
  Check, 
  Database, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  FileSpreadsheet,
  Lock,
  Layers
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, state, testConnection, syncToSheets, pullFromSheets } = useData();
  const [urlInput, setUrlInput] = useState(config.webAppUrl || '');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMsg(null);
    const result = await testConnection(urlInput);
    setTesting(false);
    if (result.success) {
      setStatusMsg({ type: 'success', text: result.message });
      updateConfig({ webAppUrl: urlInput, isConnected: true, isDemoMode: false });
    } else {
      setStatusMsg({ type: 'error', text: result.message });
    }
  };

  const handleSyncToSheets = async () => {
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

  const handlePullFromSheets = async () => {
    setSyncing(true);
    setStatusMsg(null);
    const res = await pullFromSheets();
    setSyncing(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleExportAllToCsv = () => {
    // Export main tables to CSV
    exportToCsv(state.Users, 'KELAS_DIGITAL_Users');
    exportToCsv(state.Classes, 'KELAS_DIGITAL_Classes');
    exportToCsv(state.Assignments, 'KELAS_DIGITAL_Assignments');
    exportToCsv(state.Submissions, 'KELAS_DIGITAL_Submissions');
    setStatusMsg({ type: 'info', text: 'Berhasil mengunduh berkas CSV (Users, Classes, Assignments, Submissions).' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Integrasi Database Google Sheets &amp; Apps Script
              </h2>
              <p className="text-xs text-slate-500">
                Penyimpanan terstruktur 15 Worksheet dengan Google Sheets API Web App
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
            config.isConnected
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            {config.isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-semibold text-sm mb-0.5">
                {config.isConnected
                  ? 'Status: Google Sheets Aktif & Terhubung'
                  : 'Status: Mode Penyimpanan Lokal (Data Tersimpan Aman di Browser)'}
              </div>
              <p>
                {config.isConnected
                  ? `Aplikasi terhubung langsung ke Google Sheets. Seluruh perubahan disinkronkan ke worksheet. Terakhir sinkron: ${config.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleString('id-ID') : 'Baru saja'}.`
                  : 'Anda dapat mencoba seluruh fitur aplikasi secara penuh menggunakan penyimpanan lokal browser. Untuk menyimpan data ke Google Sheets pribadi milik sekolah Anda, ikuti panduan 4 langkah di bawah.'}
              </p>
            </div>
          </div>

          {/* Feedback alert */}
          {statusMsg && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-100 text-emerald-800' 
                : statusMsg.type === 'error' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Input Web App URL */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              URL Web App Google Apps Script
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
              <button
                onClick={handleTestConnection}
                disabled={testing || !urlInput}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Uji Koneksi</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Contoh format URL: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">https://script.google.com/macros/s/[Deployment_ID]/exec</code>
            </p>
          </div>

          {/* Data Sync & Export Controls */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Aksi Sinkronisasi &amp; Cadangan Data</span>
              <span className="text-[11px] font-normal text-slate-500">15 Worksheet Terdefinisi</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleSyncToSheets}
                disabled={syncing || !urlInput}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                title="Kirim semua data lokal ke Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${syncing ? 'animate-spin' : ''}`} />
                <span>Kirim ke Sheets (Push)</span>
              </button>

              <button
                onClick={handlePullFromSheets}
                disabled={syncing || !urlInput}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                title="Tarik data terbaru dari Google Sheets"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ambil dari Sheets (Pull)</span>
              </button>

              <button
                onClick={handleExportAllToCsv}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                title="Unduh seluruh tabel dalam format CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ekspor CSV File</span>
              </button>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Panduan Konfigurasi Google Sheets (4 Langkah Mudah)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-bold">1</span>
                  <span>Buat Google Spreadsheet Baru</span>
                </div>
                <p className="text-slate-600">
                  Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a>, beri judul <strong>"KELAS DIGITAL DATABASE"</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-bold">2</span>
                  <span>Buka Apps Script Editor</span>
                </div>
                <p className="text-slate-600">
                  Di Google Sheets, klik menu <strong>Ekstensi &gt; Apps Script</strong>. Hapus isi file default <code>Code.gs</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-bold">3</span>
                  <span>Salin Kode Backend &amp; Inisialisasi</span>
                </div>
                <p className="text-slate-600">
                  Salin kode Apps Script di bawah, tempel di <code>Code.gs</code>, pilih fungsi <code>initDatabase</code> lalu klik <strong>Jalankan (Run)</strong>. Seluruh 15 sheet akan otomatis dibuat!
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-bold">4</span>
                  <span>Terapkan Sebagai Web App</span>
                </div>
                <p className="text-slate-600">
                  Klik <strong>Deploy &gt; New deployment</strong> &gt; Pilih <strong>Web app</strong>. Set <em>Execute as: Me</em> dan <em>Who has access: Anyone</em>. Salin URL Web App ke kolom di atas.
                </p>
              </div>
            </div>
          </div>

          {/* Copy Script Code Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Kode Google Apps Script (Code.gs)
              </span>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Kode Skrip (Code.gs)'}</span>
              </button>
            </div>
            <div className="relative max-h-48 overflow-y-auto rounded-xl bg-slate-900 p-4 text-[11px] font-mono text-slate-200 border border-slate-800">
              <pre>{GOOGLE_APPS_SCRIPT_CODE.slice(0, 1400)}
                {'\n... (tekan tombol di atas untuk menyalin seluruh 240+ baris kode lengkap) ...'}
              </pre>
            </div>
          </div>

          {/* 15 Sheets Schema Overview */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Struktur 15 Lembar Kerja (Worksheets) Terintegrasi</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                'Users', 'Classes', 'ClassMembers', 'Materials', 'Assignments',
                'Submissions', 'PeerAssessments', 'PeerAssessmentAssignments',
                'FormativeAssessments', 'FormativeResponses', 'Reflections',
                'LeaveRequests', 'Notifications', 'AuditLogs', 'Settings'
              ].map(sheet => (
                <span key={sheet} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md font-mono">
                  {sheet}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, UserCheck, Shield, BookOpen, Check } from 'lucide-react';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const { login, allUsers, switchUser, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Login form
  const [identifier, setIdentifier] = useState('pakbudi');
  const [loginRole, setLoginRole] = useState<UserRole>('GURU');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('MURID');
  const [regNipNisn, setRegNipNisn] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const success = login(identifier, loginRole);
    if (!success) {
      setLoginError(`Akun "${identifier}" dengan peran ${loginRole} tidak ditemukan. Silakan periksa kembali atau gunakan tombol akun demo di bawah.`);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNama.trim() || !regEmail.trim() || !regUsername.trim()) return;

    register({
      nama: regNama.trim(),
      email: regEmail.trim(),
      username: regUsername.trim().toLowerCase(),
      role: regRole,
      nisn_nip: regNipNisn.trim() || undefined
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-700 text-white shadow-lg mb-3">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          KELAS DIGITAL
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Sistem Manajemen Pembelajaran Terintegrasi Google Sheets
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          {isRegisterMode ? (
            /* Register Mode */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Pendaftaran Akun Baru
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peran Akun *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('GURU')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                      regRole === 'GURU'
                        ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Guru Pengajar
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('MURID')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                      regRole === 'MURID'
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Murid / Siswa
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap &amp; Gelar *</label>
                <input
                  type="text"
                  required
                  value={regNama}
                  onChange={(e) => setRegNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Pd."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Sekolah / Akun Belajar *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nama@guru.smp.belajar.id"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="budisantoso"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP / NISN</label>
                  <input
                    type="text"
                    value={regNipNisn}
                    onChange={(e) => setRegNipNisn(e.target.value)}
                    placeholder="19840512..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
              >
                Daftar &amp; Langsung Masuk
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-xs text-blue-700 hover:underline font-medium"
                >
                  Sudah punya akun? Masuk di sini
                </button>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Pilih Peran Masuk *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole('GURU');
                      setIdentifier('pakbudi');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                      loginRole === 'GURU'
                        ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Guru Pengajar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole('MURID');
                      setIdentifier('ahmadfauzan');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                      loginRole === 'MURID'
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Murid / Siswa
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email atau Username *
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Username atau email terdaftar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  defaultValue="******"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-slate-50"
                />
              </div>

              {loginError && (
                <div className="p-3 text-xs bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-xs text-blue-700 hover:underline font-medium"
                >
                  Belum punya akun? Buat akun baru
                </button>
              </div>

              {/* Fast Instant Demo Login */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Masuk Instan Mode Demo (1 Klik)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => switchUser('USR_GURU_01')}
                    className="p-2 text-left rounded-lg border border-slate-200 bg-indigo-50/50 hover:bg-indigo-50 text-[11px] transition-colors"
                  >
                    <span className="font-bold text-indigo-900 block truncate">Pak Budi Santoso</span>
                    <span className="text-slate-500">Guru IPA Terpadu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => switchUser('USR_MURID_01')}
                    className="p-2 text-left rounded-lg border border-slate-200 bg-teal-50/50 hover:bg-teal-50 text-[11px] transition-colors"
                  >
                    <span className="font-bold text-teal-900 block truncate">Ahmad Fauzan</span>
                    <span className="text-slate-500">Murid Kelas IX-A</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  BookOpen, 
  Plus, 
  LogIn, 
  Users, 
  Copy, 
  Check, 
  Archive, 
  Upload, 
  Download, 
  Search, 
  GraduationCap, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { ClassRoom } from '../types';

export const ClassesView: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { state, createClass, joinClassByCode, archiveClass } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states for Create Class
  const [namaKelas, setNamaKelas] = useState('');
  const [mataPelajaran, setMataPelajaran] = useState('');
  const [tingkat, setTingkat] = useState('Kelas IX');
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026 Genap');
  const [deskripsi, setDeskripsi] = useState('');

  // Join Class state
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  // Filter classes based on role
  const isTeacher = role === 'GURU';
  const filteredClasses = state.Classes.filter(c => {
    if (isTeacher) {
      if (c.teacher_id !== currentUser?.user_id) return false;
    } else {
      const isMember = state.ClassMembers.some(
        m => m.class_id === c.class_id && m.student_id === currentUser?.user_id && m.status === 'aktif'
      );
      if (!isMember) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.nama_kelas.toLowerCase().includes(q) ||
        c.mata_pelajaran.toLowerCase().includes(q) ||
        c.kode_kelas.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelas.trim() || !mataPelajaran.trim()) return;

    createClass({
      nama_kelas: namaKelas.trim(),
      mata_pelajaran: mataPelajaran.trim(),
      tingkat,
      tahun_ajaran: tahunAjaran,
      deskripsi: deskripsi.trim(),
      teacher_id: currentUser?.user_id || '',
      teacher_name: currentUser?.nama || ''
    });

    setNamaKelas('');
    setMataPelajaran('');
    setDeskripsi('');
    setShowCreateModal(false);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);

    if (!joinCode.trim()) {
      setJoinError('Masukkan kode kelas.');
      return;
    }

    const result = joinClassByCode(joinCode.trim());
    if (result.success) {
      setJoinSuccess(result.message);
      setTimeout(() => {
        setJoinCode('');
        setJoinSuccess(null);
        setShowJoinModal(false);
      }, 1500);
    } else {
      setJoinError(result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isTeacher ? 'Kelola Kelas Pembelajaran' : 'Kelas Yang Saya Ikuti'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTeacher
              ? 'Buat kelas baru, bagikan kode ke murid, dan pantau anggota kelas.'
              : 'Daftar seluruh ruang belajar aktif yang kamu ikuti.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isTeacher ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Kelas Baru</span>
            </button>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Gabung dengan Kode Kelas</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kelas, mapel, atau kode..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="text-xs text-slate-500 self-end sm:self-center tabular-nums">
          Menampilkan {filteredClasses.length} kelas
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
          <h3 className="text-sm font-bold text-slate-700">Belum ada kelas ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isTeacher
              ? 'Mulai dengan membuat ruang kelas baru untuk mata pelajaran yang Anda ampu.'
              : 'Gunakan kode kelas yang diberikan oleh gurumu untuk bergabung.'}
          </p>
          {isTeacher ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Buat Kelas Sekarang
            </button>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors"
            >
              Masukkan Kode Kelas
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map(cls => {
            const members = state.ClassMembers.filter(m => m.class_id === cls.class_id && m.status === 'aktif');
            const materialsCount = state.Materials.filter(m => m.class_id === cls.class_id && m.status === 'terbit').length;
            const assignmentsCount = state.Assignments.filter(a => a.class_id === cls.class_id && a.status === 'dipublikasikan').length;

            return (
              <div
                key={cls.class_id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Card Header with Banner Color */}
                <div className={`p-5 text-white ${cls.cover_gradient ? `bg-gradient-to-r ${cls.cover_gradient}` : 'bg-gradient-to-r from-blue-700 to-indigo-800'}`}>
                  <div className="flex items-center justify-between text-xs opacity-90 mb-1">
                    <span>{cls.mata_pelajaran}</span>
                    <span className="font-mono text-[11px] bg-black/20 px-2 py-0.5 rounded">
                      {cls.tingkat || 'Kelas IX'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight line-clamp-1">{cls.nama_kelas}</h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-1">
                    {cls.teacher_name || 'Guru Pengampu'}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {cls.deskripsi || 'Tidak ada deskripsi tambahan untuk kelas ini.'}
                  </p>

                  {/* Class Code Box for Guru */}
                  {isTeacher && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Kode Undangan Siswa</span>
                        <span className="text-xs font-mono font-bold text-blue-700 tracking-wider">
                          {cls.kode_kelas}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(cls.kode_kelas)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
                      >
                        {copiedCode === cls.kode_kelas ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Summary indicators */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div>
                      <div className="text-xs font-bold text-slate-800 tabular-nums">{members.length}</div>
                      <div className="text-[10px] text-slate-400">Murid</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 tabular-nums">{materialsCount}</div>
                      <div className="text-[10px] text-slate-400">Materi</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 tabular-nums">{assignmentsCount}</div>
                      <div className="text-[10px] text-slate-400">Tugas</div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedClass(cls)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Daftar Siswa ({members.length})</span>
                  </button>

                  {isTeacher && (
                    <button
                      onClick={() => archiveClass(cls.class_id)}
                      className="text-xs text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Arsipkan Kelas"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Class Members Drawer / Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedClass.nama_kelas}</h3>
                <p className="text-xs text-slate-500">Anggota dan Siswa Terdaftar</p>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Guru Pengajar
              </div>
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                  G
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{selectedClass.teacher_name}</div>
                  <div className="text-[11px] text-slate-500">Wali & Pengampu Mata Pelajaran</div>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">
                Daftar Murid ({state.ClassMembers.filter(m => m.class_id === selectedClass.class_id && m.status === 'aktif').length})
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {state.ClassMembers.filter(m => m.class_id === selectedClass.class_id && m.status === 'aktif').map(member => (
                  <div key={member.membership_id} className="p-3 flex items-center justify-between bg-white text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {member.student_name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{member.student_name}</div>
                        <div className="text-[10px] text-slate-400">{member.student_email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Bergabung {new Date(member.tanggal_bergabung).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedClass(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Class (Guru) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">Buat Kelas Pembelajaran Baru</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kelas *</label>
                <input
                  type="text"
                  required
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  placeholder="Contoh: IPA Terpadu IX-B"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran *</label>
                <input
                  type="text"
                  required
                  value={mataPelajaran}
                  onChange={(e) => setMataPelajaran(e.target.value)}
                  placeholder="Contoh: Ilmu Pengetahuan Alam"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="Kelas VII">Kelas VII (Tujuh)</option>
                    <option value="Kelas VIII">Kelas VIII (Delapan)</option>
                    <option value="Kelas IX">Kelas IX (Sembilan)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={tahunAjaran}
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Deskripsi ruang kelas, topik materi, atau instruksi umum..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
                >
                  Buat Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Class (Murid) */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">Gabung ke Kelas</h3>
              <button onClick={() => setShowJoinModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Mintalah kode kelas 6 karakter kepada gurumu, lalu masukkan di bawah ini.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Kelas *</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Misal: IPA9A1 atau MTK9A2"
                  className="w-full px-3.5 py-2.5 text-center font-mono text-base font-bold tracking-widest uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {joinError && (
                <div className="p-2.5 text-xs font-medium text-rose-800 bg-rose-50 rounded-lg border border-rose-200">
                  {joinError}
                </div>
              )}

              {joinSuccess && (
                <div className="p-2.5 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
                  {joinSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
                >
                  Gabung Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

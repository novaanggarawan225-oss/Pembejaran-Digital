import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  MailCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Paperclip, 
  ExternalLink, 
  Check, 
  X,
  FileSpreadsheet,
  AlertCircle,
  Send
} from 'lucide-react';
import { LeaveRequest, LeaveType, LeaveStatus } from '../types';

export const LeaveRequestsView: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { state, submitLeaveRequest, reviewLeaveRequest } = useData();

  const isTeacher = role === 'GURU';

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | LeaveStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | LeaveType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLeaveForReview, setSelectedLeaveForReview] = useState<LeaveRequest | null>(null);

  // Murid Form State
  const [formClassId, setFormClassId] = useState('');
  const [formJenisIzin, setFormJenisIzin] = useState<LeaveType>('sakit');
  const [formTglMulai, setFormTglMulai] = useState('');
  const [formTglSelesai, setFormTglSelesai] = useState('');
  const [formAlasan, setFormAlasan] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  // Guru Review Form State
  const [reviewDecision, setReviewDecision] = useState<'disetujui' | 'ditolak'>('disetujui');
  const [teacherNotes, setTeacherNotes] = useState('');

  // Accessible classes
  const userClasses = state.Classes.filter(c => {
    if (isTeacher) return c.teacher_id === currentUser?.user_id;
    return state.ClassMembers.some(m => m.class_id === c.class_id && m.student_id === currentUser?.user_id && m.status === 'aktif');
  });
  const userClassIds = userClasses.map(c => c.class_id);

  // Filter list
  const filteredLeaves = state.LeaveRequests.filter(l => {
    if (!userClassIds.includes(l.class_id)) return false;
    // Murid only sees their own leave letters
    if (!isTeacher && l.student_id !== currentUser?.user_id) return false;

    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (typeFilter !== 'all' && l.jenis_izin !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (l.student_name || '').toLowerCase().includes(q);
      const matchReason = l.alasan.toLowerCase().includes(q);
      return matchName || matchReason;
    }
    return true;
  }).sort((a, b) => new Date(b.tanggal_pengajuan).getTime() - new Date(a.tanggal_pengajuan).getTime());

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassId || !formTglMulai || !formTglSelesai || !formAlasan.trim()) return;

    const targetClass = state.Classes.find(c => c.class_id === formClassId);

    submitLeaveRequest({
      class_id: formClassId,
      class_name: targetClass?.nama_kelas || 'Kelas',
      student_id: currentUser?.user_id || '',
      student_name: currentUser?.nama || '',
      jenis_izin: formJenisIzin,
      tanggal_mulai: formTglMulai,
      tanggal_selesai: formTglSelesai,
      alasan: formAlasan.trim(),
      attachment_url: formAttachmentUrl.trim() || undefined
    });

    setApplySuccess(true);
    setFormAlasan('');
    setFormAttachmentUrl('');
    setTimeout(() => {
      setApplySuccess(false);
      setShowApplyModal(false);
    }, 1500);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveForReview) return;

    reviewLeaveRequest(
      selectedLeaveForReview.leave_id,
      reviewDecision,
      teacherNotes.trim()
    );

    setSelectedLeaveForReview(null);
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'disetujui':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Disetujui</span>
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Ditolak</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Persetujuan</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Surat Izin Tidak Masuk Kelas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTeacher
              ? 'Tinjau permohonan izin sakit, izin dinas, atau keperluan keluarga murid dan berikan keputusan resmi.'
              : 'Ajukan surat permohonan izin resmi bila berhalangan mengikuti kegiatan belajar mengajar.'}
          </p>
        </div>

        {!isTeacher && (
          <button
            onClick={() => {
              setFormClassId(userClasses[0]?.class_id || '');
              const today = new Date().toISOString().slice(0, 10);
              setFormTglMulai(today);
              setFormTglSelesai(today);
              setShowApplyModal(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Surat Izin Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTeacher ? "Cari nama murid atau alasan..." : "Cari alasan pengajuan..."}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Jenis:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Semua Jenis</option>
              <option value="sakit">Sakit</option>
              <option value="keperluan_keluarga">Keperluan Keluarga</option>
              <option value="tugas_sekolah">Tugas Sekolah</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <span className="text-slate-400 tabular-nums ml-auto">
            {filteredLeaves.length} surat
          </span>
        </div>
      </div>

      {/* Leaves List */}
      {filteredLeaves.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <MailCheck className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
          <h3 className="text-sm font-bold text-slate-700">Belum ada surat permohonan izin</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isTeacher
              ? 'Seluruh murid di kelas Anda hadir lengkap atau belum ada surat baru yang diajukan.'
              : 'Bila kamu sakit atau memiliki keperluan mendesak, silakan ajukan surat izin melalui tombol di atas.'}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white shadow-2xs">
          {filteredLeaves.map(leave => {
            const cls = state.Classes.find(c => c.class_id === leave.class_id);

            return (
              <div
                key={leave.leave_id}
                className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {leave.student_name}
                    </span>
                    <span className="text-slate-300">&middot;</span>
                    <span className="font-semibold text-blue-700">
                      {cls?.nama_kelas || leave.class_name}
                    </span>
                    <span className="text-slate-300">&middot;</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {leave.jenis_izin.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Periode: <strong>{leave.tanggal_mulai}</strong> s.d <strong>{leave.tanggal_selesai}</strong></span>
                    </span>
                    <span>&middot;</span>
                    <span>Diajukan: {new Date(leave.tanggal_pengajuan).toLocaleDateString('id-ID')}</span>
                  </div>

                  <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{leave.alasan}"
                  </p>

                  {/* Supporting attachment */}
                  {leave.attachment_url && (
                    <div className="pt-0.5">
                      <a
                        href={leave.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold text-[11px]"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>Lihat Berkas Pendukung / Surat Dokter</span>
                      </a>
                    </div>
                  )}

                  {/* Teacher notes & decision audit if decided */}
                  {leave.catatan_guru && (
                    <div className="text-[11px] text-slate-600 bg-blue-50/60 p-2 rounded border border-blue-100">
                      <strong className="text-blue-900">Catatan Wali/Guru ({leave.keputusan_guru_name}):</strong> {leave.catatan_guru}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                  <div>{getStatusBadge(leave.status)}</div>

                  {/* Teacher action button */}
                  {isTeacher && leave.status === 'menunggu' && (
                    <button
                      onClick={() => {
                        setSelectedLeaveForReview(leave);
                        setReviewDecision('disetujui');
                        setTeacherNotes('');
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
                    >
                      Proses Keputusan Izin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Murid Apply Leave */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">Formulir Pengajuan Surat Izin</h3>
              <button onClick={() => setShowApplyModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            {applySuccess ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Surat Izin Berhasil Diajukan!</h4>
                <p className="text-xs text-slate-500">Status saat ini menunggu peninjauan dan persetujuan wali kelas.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas yang Diikuti *</label>
                  <select
                    required
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    {userClasses.map(c => (
                      <option key={c.class_id} value={c.class_id}>{c.nama_kelas}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Izin *</label>
                  <select
                    value={formJenisIzin}
                    onChange={(e) => setFormJenisIzin(e.target.value as LeaveType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="sakit">Sakit</option>
                    <option value="keperluan_keluarga">Keperluan Keluarga</option>
                    <option value="tugas_sekolah">Tugas / Dinas Sekolah</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai *</label>
                    <input
                      type="date"
                      required
                      value={formTglMulai}
                      onChange={(e) => setFormTglMulai(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai *</label>
                    <input
                      type="date"
                      required
                      value={formTglSelesai}
                      onChange={(e) => setFormTglSelesai(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alasan Izin Rinci *</label>
                  <textarea
                    required
                    rows={3}
                    value={formAlasan}
                    onChange={(e) => setFormAlasan(e.target.value)}
                    placeholder="Jelaskan alasan izin Anda secara jelas dan sopan..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tautan Surat Dokter / Berkas Pendukung (Opsional)</label>
                  <input
                    type="url"
                    value={formAttachmentUrl}
                    onChange={(e) => setFormAttachmentUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Pengajuan Izin</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Guru Review Leave Request */}
      {selectedLeaveForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                Persetujuan Surat Izin: {selectedLeaveForReview.student_name}
              </h3>
              <button onClick={() => setSelectedLeaveForReview(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Jenis: {selectedLeaveForReview.jenis_izin.replace('_', ' ').toUpperCase()}</span>
                  <span>{selectedLeaveForReview.tanggal_mulai} s.d {selectedLeaveForReview.tanggal_selesai}</span>
                </div>
                <p className="text-slate-600 italic">"{selectedLeaveForReview.alasan}"</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Keputusan Guru *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('disetujui')}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-colors ${
                      reviewDecision === 'disetujui'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui Izin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('ditolak')}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-colors ${
                      reviewDecision === 'ditolak'
                        ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Tolak Izin</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Guru / Alasan Penolakan {reviewDecision === 'ditolak' ? '*' : '(Opsional)'}
                </label>
                <textarea
                  required={reviewDecision === 'ditolak'}
                  rows={3}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder={
                    reviewDecision === 'ditolak'
                      ? 'Tuliskan alasan mengapa izin tidak disetujui...'
                      : 'Contoh: Semoga lekas sembuh, tetap pantau materi kelas...'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLeaveForReview(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
                >
                  Simpan Keputusan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  Calendar, 
  FileText, 
  Link as LinkIcon, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Search, 
  Eye, 
  Send, 
  X, 
  Award,
  ExternalLink,
  MessageSquare,
  FileCheck,
  RefreshCw,
  Paperclip
} from 'lucide-react';
import { Assignment, Submission, AnswerType, SubmissionStatus } from '../types';

export const AssignmentsView: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { state, createAssignment, updateAssignment, submitAssignment, gradeSubmission } = useData();

  const isTeacher = role === 'GURU';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);

  // Teacher Create/Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formClassId, setFormClassId] = useState('');
  const [formJudul, setFormJudul] = useState('');
  const [formInstruksi, setFormInstruksi] = useState('');
  const [formJenisJawaban, setFormJenisJawaban] = useState<AnswerType>('kombinasi');
  const [formNilaiMaks, setFormNilaiMaks] = useState(100);
  const [formTenggat, setFormTenggat] = useState('');

  // Student Submission Form State
  const [studentJawabanTeks, setStudentJawabanTeks] = useState('');
  const [studentJawabanUrl, setStudentJawabanUrl] = useState('');
  const [studentFileName, setStudentFileName] = useState('');
  const [submittingError, setSubmittingError] = useState<string | null>(null);
  const [submittingSuccess, setSubmittingSuccess] = useState<string | null>(null);

  // Teacher Grading Form State
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [needRevision, setNeedRevision] = useState(false);

  // Accessible classes for current user
  const userClasses = state.Classes.filter(c => {
    if (isTeacher) return c.teacher_id === currentUser?.user_id;
    return state.ClassMembers.some(m => m.class_id === c.class_id && m.student_id === currentUser?.user_id && m.status === 'aktif');
  });
  const userClassIds = userClasses.map(c => c.class_id);

  // Filter assignments
  const filteredAssignments = state.Assignments.filter(a => {
    if (!userClassIds.includes(a.class_id)) return false;
    if (!isTeacher && a.status === 'draf') return false;
    if (selectedClassFilter !== 'all' && a.class_id !== selectedClassFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.judul.toLowerCase().includes(q) || a.instruksi.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormClassId(userClasses[0]?.class_id || '');
    setFormJudul('');
    setFormInstruksi('');
    setFormJenisJawaban('kombinasi');
    setFormNilaiMaks(100);
    // default 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 0, 0);
    setFormTenggat(d.toISOString().slice(0, 16));
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formClassId || !formTenggat) return;

    if (editingId) {
      updateAssignment(editingId, {
        class_id: formClassId,
        judul: formJudul.trim(),
        instruksi: formInstruksi.trim(),
        jenis_jawaban: formJenisJawaban,
        nilai_maksimum: Number(formNilaiMaks),
        tenggat: new Date(formTenggat).toISOString()
      });
    } else {
      createAssignment({
        class_id: formClassId,
        teacher_id: currentUser?.user_id || '',
        judul: formJudul.trim(),
        instruksi: formInstruksi.trim(),
        jenis_jawaban: formJenisJawaban,
        nilai_maksimum: Number(formNilaiMaks),
        tanggal_mulai: new Date().toISOString(),
        tenggat: new Date(formTenggat).toISOString(),
        status: 'dipublikasikan'
      });
    }

    setShowCreateModal(false);
  };

  const handleOpenAssignmentDetail = (task: Assignment) => {
    setSelectedAssignment(task);
    setSubmittingError(null);
    setSubmittingSuccess(null);

    // If student, populate with their existing submission if any
    if (!isTeacher) {
      const existing = state.Submissions.find(
        s => s.assignment_id === task.assignment_id && s.student_id === currentUser?.user_id
      );
      if (existing) {
        setStudentJawabanTeks(existing.jawaban_teks || '');
        setStudentJawabanUrl(existing.jawaban_url || '');
        setStudentFileName(existing.attachment_name || '');
      } else {
        setStudentJawabanTeks('');
        setStudentJawabanUrl('');
        setStudentFileName('');
      }
    }
  };

  const handleStudentSubmit = (isDraft: boolean) => {
    if (!selectedAssignment) return;
    setSubmittingError(null);

    if (!isDraft && !studentJawabanTeks.trim() && !studentJawabanUrl.trim() && !studentFileName.trim()) {
      setSubmittingError('Mohon isi minimal salah satu bentuk jawaban (teks, link URL, atau file).');
      return;
    }

    try {
      submitAssignment({
        assignment_id: selectedAssignment.assignment_id,
        jawaban_teks: studentJawabanTeks.trim(),
        jawaban_url: studentJawabanUrl.trim() || undefined,
        attachment_name: studentFileName.trim() || undefined,
        attachment_url: studentFileName ? `https://drive.google.com/uc?file=${encodeURIComponent(studentFileName)}` : undefined,
        isDraft
      });

      setSubmittingSuccess(isDraft ? 'Draf jawaban berhasil disimpan!' : 'Jawaban tugas berhasil dikumpulkan ke guru!');
    } catch (err: any) {
      setSubmittingError(err.message || 'Gagal mengirim tugas.');
    }
  };

  const handleTeacherGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    gradeSubmission(
      gradingSubmission.submission_id,
      Number(gradeScore),
      gradeFeedback.trim(),
      needRevision
    );

    setGradingSubmission(null);
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'sudah_dinilai':
        return <span className="text-emerald-700 font-semibold">Sudah Dinilai</span>;
      case 'perlu_revisi':
        return <span className="text-rose-700 font-semibold">Perlu Revisi</span>;
      case 'terlambat':
        return <span className="text-amber-700 font-semibold">Terkumpul (Terlambat)</span>;
      case 'dikumpulkan':
        return <span className="text-blue-700 font-semibold">Sudah Dikumpulkan</span>;
      case 'draf':
        return <span className="text-slate-500 font-semibold">Draf Jawaban</span>;
      default:
        return <span className="text-slate-400 font-normal">Belum Mengerjakan</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isTeacher ? 'Tugas &amp; Penilaian Kelas' : 'Tugas Pembelajaran Saya'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTeacher
              ? 'Buat instruksi penugasan, pantau status pengumpulan seluruh murid, dan berikan nilai & umpan balik.'
              : 'Baca instruksi pengerjaan, ketik jawaban, kirim tautan karya, dan lihat umpan balik guru.'}
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Tugas Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul tugas atau instruksi..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Kelas:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Semua Kelas ({userClasses.length})</option>
              {userClasses.map(c => (
                <option key={c.class_id} value={c.class_id}>{c.nama_kelas}</option>
              ))}
            </select>
          </div>
          <span className="text-slate-400 tabular-nums ml-auto">
            {filteredAssignments.length} tugas
          </span>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <CheckSquare className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
          <h3 className="text-sm font-bold text-slate-700">Belum ada tugas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isTeacher
              ? 'Buat tugas pertama Anda untuk menguji pemahaman murid secara berkala.'
              : 'Belum ada tugas yang diberikan oleh gurumu.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments.map(task => {
            const cls = state.Classes.find(c => c.class_id === task.class_id);
            const isOverdue = new Date() > new Date(task.tenggat);
            
            // Submissions count
            const taskSubmissions = state.Submissions.filter(s => s.assignment_id === task.assignment_id);
            const totalEnrolled = state.ClassMembers.filter(m => m.class_id === task.class_id && m.status === 'aktif').length;
            const mySubmission = !isTeacher
              ? state.Submissions.find(s => s.assignment_id === task.assignment_id && s.student_id === currentUser?.user_id)
              : null;

            return (
              <div
                key={task.assignment_id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-blue-700 truncate max-w-[160px]">
                      {cls?.nama_kelas}
                    </span>
                    <span className={`text-[11px] font-medium flex items-center gap-1 ${
                      isOverdue ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(task.tenggat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                      {task.judul}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {task.instruksi}
                    </p>
                  </div>

                  {/* Submission Status or Progress */}
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    {isTeacher ? (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Pengumpulan Murid:</span>
                        <span className="font-bold tabular-nums">
                          {taskSubmissions.filter(s => s.status !== 'draf').length} / {totalEnrolled} Murid
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Status Tugas:</span>
                        <div>
                          {mySubmission ? getStatusBadge(mySubmission.status) : (
                            <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                              {isOverdue ? 'Terlambat (Belum)' : 'Belum Dikerjakan'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Student Grade display if graded */}
                  {!isTeacher && mySubmission?.nilai !== null && mySubmission?.nilai !== undefined && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-900">Nilai Kamu:</span>
                      <span className="font-bold text-base text-emerald-700 tabular-nums">
                        {mySubmission.nilai} / {task.nilai_maksimum}
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenAssignmentDetail(task)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isTeacher ? 'Buka & Periksa Jawaban' : 'Kerjakan / Lihat Detail'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400 capitalize">
                    {task.jenis_jawaban}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Assignment Detail (Student Submission & Teacher Review) */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <div className="overflow-hidden">
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                  {state.Classes.find(c => c.class_id === selectedAssignment.class_id)?.nama_kelas}
                </span>
                <h2 className="text-base font-bold text-slate-900 truncate">
                  {selectedAssignment.judul}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800 flex-1">
              {/* Instructions Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Instruksi Pengerjaan:</span>
                  <span>Tenggat: {new Date(selectedAssignment.tenggat).toLocaleString('id-ID')}</span>
                </div>
                <p className="whitespace-pre-line text-slate-700 leading-relaxed">
                  {selectedAssignment.instruksi}
                </p>
                {selectedAssignment.attachment_url && (
                  <div className="pt-2">
                    <a
                      href={selectedAssignment.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-700 hover:underline font-semibold"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Lampiran Pedoman Tugas</span>
                    </a>
                  </div>
                )}
              </div>

              {/* ---------------- MURID VIEW: SUBMISSION FORM ---------------- */}
              {!isTeacher && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Send className="w-4 h-4 text-teal-600" />
                    <span>Lembar Jawaban Murid</span>
                  </h3>

                  {submittingError && (
                    <div className="p-3 text-xs bg-red-50 text-red-800 rounded-lg border border-red-200">
                      {submittingError}
                    </div>
                  )}

                  {submittingSuccess && (
                    <div className="p-3 text-xs bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                      {submittingSuccess}
                    </div>
                  )}

                  {/* Text Answer */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Ketik Jawaban Langsung
                    </label>
                    <textarea
                      rows={5}
                      value={studentJawabanTeks}
                      onChange={(e) => setStudentJawabanTeks(e.target.value)}
                      placeholder="Tuliskan jawaban, uraian, analisis, atau catatan tugas Anda di sini..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-sans"
                    />
                  </div>

                  {/* URL Link */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tautan Dokumen / Karya Luar (Google Docs, Slides, Canva, Video)
                    </label>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="url"
                        value={studentJawabanUrl}
                        onChange={(e) => setStudentJawabanUrl(e.target.value)}
                        placeholder="https://docs.google.com/document/d/... atau https://canva.com/..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  {/* File Simulation */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Lampiran Berkas (PDF, Gambar, Word)
                    </label>
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={studentFileName}
                        onChange={(e) => setStudentFileName(e.target.value)}
                        placeholder="Nama file lampiran (Contoh: Laporan_Fauzan_Tugas1.pdf)"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  {/* Previous submission review if any */}
                  {(() => {
                    const existing = state.Submissions.find(
                      s => s.assignment_id === selectedAssignment.assignment_id && s.student_id === currentUser?.user_id
                    );
                    if (!existing) return null;

                    return (
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 mt-4">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>Catatan Status Pengumpulan Sebelumnya</span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(existing.submitted_at).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          Status: {getStatusBadge(existing.status)}
                        </div>
                        {existing.feedback && (
                          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs mt-2">
                            <span className="font-bold text-slate-800 block mb-0.5">Umpan Balik Guru:</span>
                            <span className="text-slate-600 italic">"{existing.feedback}"</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleStudentSubmit(true)}
                      className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Simpan Sebagai Draf
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStudentSubmit(false)}
                      className="px-5 py-2 font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Jawaban Tugas</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------- GURU VIEW: SUBMISSION LIST & GRADING ---------------- */}
              {isTeacher && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Daftar Pengumpulan Siswa di Kelas Ini
                    </h3>
                    <span className="text-xs text-slate-500">
                      Nilai Maksimum: <strong>{selectedAssignment.nilai_maksimum}</strong>
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {state.ClassMembers.filter(m => m.class_id === selectedAssignment.class_id && m.status === 'aktif').map(member => {
                      const sub = state.Submissions.find(
                        s => s.assignment_id === selectedAssignment.assignment_id && s.student_id === member.student_id
                      );

                      return (
                        <div key={member.membership_id} className="p-4 bg-white hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{member.student_name}</span>
                              {sub?.nilai !== null && sub?.nilai !== undefined && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-bold tabular-nums">
                                  Nilai: {sub.nilai}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>{sub ? getStatusBadge(sub.status) : 'Belum Mengumpulkan'}</span>
                              {sub && (
                                <>
                                  <span>&middot;</span>
                                  <span>{new Date(sub.submitted_at).toLocaleDateString('id-ID')}</span>
                                </>
                              )}
                            </div>

                            {/* Short preview of answers if submitted */}
                            {sub && (
                              <div className="mt-2 space-y-1 text-slate-600">
                                {sub.jawaban_teks && (
                                  <p className="line-clamp-1 italic">"{sub.jawaban_teks}"</p>
                                )}
                                {sub.jawaban_url && (
                                  <a
                                    href={sub.jawaban_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 underline inline-flex items-center gap-1 font-medium"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Buka Tautan Jawaban</span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {sub ? (
                              <button
                                onClick={() => {
                                  setGradingSubmission(sub);
                                  setGradeScore(sub.nilai ?? 85);
                                  setGradeFeedback(sub.feedback ?? '');
                                  setNeedRevision(sub.status === 'perlu_revisi');
                                }}
                                className="px-3 py-1.5 font-semibold text-xs text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>{sub.nilai !== null ? 'Ubah Nilai' : 'Beri Nilai'}</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Belum Ada Berkas</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Teacher Grading Single Student Submission */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                Penilaian Tugas: {gradingSubmission.student_name}
              </h3>
              <button onClick={() => setGradingSubmission(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTeacherGrade} className="p-5 space-y-4 text-xs">
              {/* Submission preview */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-700 block">Jawaban yang Dikirim Siswa:</span>
                {gradingSubmission.jawaban_teks && (
                  <p className="text-slate-600 italic whitespace-pre-line max-h-32 overflow-y-auto">
                    {gradingSubmission.jawaban_teks}
                  </p>
                )}
                {gradingSubmission.jawaban_url && (
                  <div className="pt-1">
                    <a
                      href={gradingSubmission.jawaban_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{gradingSubmission.jawaban_url}</span>
                    </a>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Skor Nilai (0 - 100) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Umpan Balik Guru (Feedback) *
                </label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Berikan apresiasi, koreksi konstruktif, atau catatan bimbingan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkRevision"
                  checked={needRevision}
                  onChange={(e) => setNeedRevision(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="chkRevision" className="font-medium text-slate-700 cursor-pointer">
                  Minta Siswa Melakukan Revisi Tugas Ini
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
                >
                  Simpan &amp; Kirim Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Teacher Create Task */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? 'Edit Tugas' : 'Buat Tugas Baru'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas Tujuan *</label>
                  <select
                    required
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    {userClasses.map(c => (
                      <option key={c.class_id} value={c.class_id}>
                        {c.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tenggat Pengumpulan *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formTenggat}
                    onChange={(e) => setFormTenggat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Tugas *</label>
                <input
                  type="text"
                  required
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Laporan Praktikum Sirkuit Listrik"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instruksi Lengkap Pengerjaan *</label>
                <textarea
                  required
                  rows={5}
                  value={formInstruksi}
                  onChange={(e) => setFormInstruksi(e.target.value)}
                  placeholder="Tuliskan petunjuk kerja, kriteria penilaian, dan format yang diharapkan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Jawaban Diizinkan</label>
                  <select
                    value={formJenisJawaban}
                    onChange={(e) => setFormJenisJawaban(e.target.value as AnswerType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="kombinasi">Kombinasi (Teks, Tautan, atau Berkas)</option>
                    <option value="teks">Teks Langsung di Aplikasi</option>
                    <option value="url">Tautan Eksternal (Google Docs / Slides)</option>
                    <option value="file">Unggah Berkas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nilai Maksimum</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={formNilaiMaks}
                    onChange={(e) => setFormNilaiMaks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
                >
                  {editingId ? 'Simpan Perubahan' : 'Publikasikan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

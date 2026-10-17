import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  Users2, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  Send, 
  ShieldCheck, 
  Eye, 
  X,
  MessageSquare,
  Award,
  Sparkles
} from 'lucide-react';
import { PeerAssessment, PeerAssessmentAssignment, RubricCriterion } from '../types';

export const PeerAssessmentView: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { state, createPeerAssessment, submitPeerEvaluation } = useData();

  const isTeacher = role === 'GURU';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeEvaluateAssignment, setActiveEvaluateAssignment] = useState<PeerAssessmentAssignment | null>(null);
  const [viewSummaryAssessment, setViewSummaryAssessment] = useState<PeerAssessment | null>(null);

  // Teacher Form State
  const [formClassId, setFormClassId] = useState('');
  const [formJudul, setFormJudul] = useState('');
  const [formInstruksi, setFormInstruksi] = useState('');
  const [formTenggat, setFormTenggat] = useState('');
  const [formIsAnonymous, setFormIsAnonymous] = useState(true);
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([
    {
      id: 'CRIT_01',
      nama_kriteria: 'Penguasaan Konsep & Prosedur',
      deskripsi: 'Kesesuaian langkah unjuk kerja dengan panduan dan pemahaman materi.',
      skor_min: 1,
      skor_max: 5,
      bobot_persen: 35
    },
    {
      id: 'CRIT_02',
      nama_kriteria: 'Keterampilan Komunikasi & Presentasi',
      deskripsi: 'Kejelasan suara, artikulasi, dan ketepatan intonasi penyampaian.',
      skor_min: 1,
      skor_max: 5,
      bobot_persen: 35
    },
    {
      id: 'CRIT_03',
      nama_kriteria: 'Sikap Kerja & Kerapian',
      deskripsi: 'Kedisiplinan, keselamatan kerja, serta estetika hasil karya.',
      skor_min: 1,
      skor_max: 5,
      bobot_persen: 30
    }
  ]);

  // Student Evaluation State
  const [evalScores, setEvalScores] = useState<Record<string, number>>({});
  const [evalComment, setEvalComment] = useState('');
  const [evalError, setEvalError] = useState<string | null>(null);
  const [evalSuccess, setEvalSuccess] = useState<string | null>(null);

  // Accessible classes
  const userClasses = state.Classes.filter(c => {
    if (isTeacher) return c.teacher_id === currentUser?.user_id;
    return state.ClassMembers.some(m => m.class_id === c.class_id && m.student_id === currentUser?.user_id && m.status === 'aktif');
  });
  const userClassIds = userClasses.map(c => c.class_id);

  // Teacher activities list
  const teacherAssessments = state.PeerAssessments.filter(p => userClassIds.includes(p.class_id));

  // Student assigned peer evaluations (evaluating others)
  const studentAssignmentsToEvaluate = state.PeerAssessmentAssignments.filter(
    pa => pa.evaluator_id === currentUser?.user_id
  );

  // Student reviews received from others
  const studentReviewsReceived = state.PeerAssessmentAssignments.filter(
    pa => pa.evaluated_student_id === currentUser?.user_id && pa.status === 'dikumpulkan'
  );

  const handleOpenEvaluate = (pa: PeerAssessmentAssignment) => {
    setActiveEvaluateAssignment(pa);
    setEvalScores(pa.jawaban_rubrik_json || {});
    setEvalComment(pa.komentar || '');
    setEvalError(null);
    setEvalSuccess(null);
  };

  const handleAddCriterion = () => {
    const newId = `CRIT_${Date.now().toString(36)}`;
    setRubricCriteria([
      ...rubricCriteria,
      {
        id: newId,
        nama_kriteria: 'Kriteria Baru',
        deskripsi: 'Deskripsi kriteria penilaian...',
        skor_min: 1,
        skor_max: 5,
        bobot_persen: 20
      }
    ]);
  };

  const handleRemoveCriterion = (id: string) => {
    if (rubricCriteria.length <= 1) return;
    setRubricCriteria(rubricCriteria.filter(c => c.id !== id));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formClassId || !formTenggat) return;

    createPeerAssessment({
      class_id: formClassId,
      teacher_id: currentUser?.user_id || '',
      judul: formJudul.trim(),
      instruksi: formInstruksi.trim(),
      tenggat: new Date(formTenggat).toISOString(),
      status: 'aktif',
      is_anonymous: formIsAnonymous,
      rubrik_json: rubricCriteria
    });

    setShowCreateModal(false);
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvaluateAssignment) return;
    setEvalError(null);

    const assessment = state.PeerAssessments.find(a => a.assessment_id === activeEvaluateAssignment.assessment_id);
    if (!assessment) return;

    // Validate that all criteria have scores
    for (const c of assessment.rubrik_json) {
      if (!evalScores[c.id]) {
        setEvalError(`Harap berikan skor untuk kriteria "${c.nama_kriteria}".`);
        return;
      }
    }

    if (!evalComment.trim()) {
      setEvalError('Harap tuliskan komentar umpan balik yang membangun untuk temanmu.');
      return;
    }

    submitPeerEvaluation(
      activeEvaluateAssignment.peer_assignment_id,
      evalScores,
      evalComment.trim()
    );

    setEvalSuccess('Penilaian unjuk kerja rekan berhasil dikirimkan!');
    setTimeout(() => {
      setActiveEvaluateAssignment(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Asesmen Praktik Antarteman (Peer Assessment)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTeacher
              ? 'Kelola rubrik evaluasi unjuk kerja dan pantau partisipasi saling menilai antarmurid.'
              : 'Berikan penilaian objektif dan masukan yang membangun bagi unjuk kerja rekan sekelas.'}
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => {
              setFormClassId(userClasses[0]?.class_id || '');
              setFormJudul('');
              setFormInstruksi('');
              const d = new Date();
              d.setDate(d.getDate() + 7);
              setFormTenggat(d.toISOString().slice(0, 16));
              setShowCreateModal(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Asesmen Praktik Baru</span>
          </button>
        )}
      </div>

      {/* ---------------- GURU VIEW: ACTIVITIES & MONITORING ---------------- */}
      {isTeacher && (
        <div className="space-y-5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Kegiatan Praktik Aktif ({teacherAssessments.length})
          </div>

          {teacherAssessments.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <Users2 className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <h3 className="text-sm font-bold text-slate-700">Belum ada kegiatan asesmen antarteman</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Buat rubrik penilaian praktik untuk membiasakan siswa memberikan umpan balik konstruktif.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {teacherAssessments.map(item => {
                const cls = state.Classes.find(c => c.class_id === item.class_id);
                const assignments = state.PeerAssessmentAssignments.filter(p => p.assessment_id === item.assessment_id);
                const completedCount = assignments.filter(p => p.status === 'dikumpulkan').length;

                return (
                  <div key={item.assessment_id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-blue-700">{cls?.nama_kelas}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Tenggat: {new Date(item.tenggat).toLocaleDateString('id-ID')}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{item.judul}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{item.instruksi}</p>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Progres Penilaian Siswa:</span>
                        <span className="font-bold tabular-nums">
                          {completedCount} / {assignments.length} Pasangan ({assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${assignments.length > 0 ? (completedCount / assignments.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Mode: {item.is_anonymous ? 'Penilaian Anonim' : 'Identitas Terbuka'}
                      </span>
                      <button
                        onClick={() => setViewSummaryAssessment(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Rekap Penilaian</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------- MURID VIEW: TO EVALUATE & REVIEWS RECEIVED ---------------- */}
      {!isTeacher && (
        <div className="space-y-6">
          {/* Section 1: Tasks assigned to evaluate others */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users2 className="w-4 h-4 text-teal-600" />
              <span>Daftar Teman yang Harus Kamu Nilai</span>
            </h2>

            {studentAssignmentsToEvaluate.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                Belum ada penugasan penilaian unjuk kerja rekan untuk akun Anda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentAssignmentsToEvaluate.map(item => {
                  const assessment = state.PeerAssessments.find(a => a.assessment_id === item.assessment_id);
                  const isDone = item.status === 'dikumpulkan';

                  return (
                    <div key={item.peer_assignment_id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span className="font-semibold text-teal-700">{assessment?.judul || 'Asesmen Praktik'}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {isDone ? 'Sudah Dinilai' : 'Menunggu Penilaianmu'}
                          </span>
                        </div>

                        <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Teman yang Dinilai:</span>
                          <span className="text-sm font-bold text-slate-900">
                            {item.evaluated_student_name}
                          </span>
                        </div>

                        {isDone && item.total_skor !== undefined && (
                          <div className="mt-2 text-xs text-slate-600">
                            Skor yang kamu berikan: <strong className="text-emerald-700 tabular-nums">{item.total_skor} / 100</strong>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        {isDone ? (
                          <button
                            onClick={() => handleOpenEvaluate(item)}
                            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            Lihat Nilai &amp; Komentar yang Kamu Kirim
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenEvaluate(item)}
                            className="w-full px-3 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>Mulai Isi Rubrik Penilaian &rarr;</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Feedback received from peers */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Umpan Balik &amp; Penilaian yang Kamu Terima</span>
            </h2>

            {studentReviewsReceived.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                Belum ada rekan yang menyelesaikan penilaian unjuk kerja milikmu.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentReviewsReceived.map(review => {
                  const assessment = state.PeerAssessments.find(a => a.assessment_id === review.assessment_id);
                  const isAnon = assessment?.is_anonymous ?? true;

                  return (
                    <div key={review.peer_assignment_id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-purple-700">{assessment?.judul}</span>
                        <span className="text-base font-bold text-emerald-700 tabular-nums">
                          Skor: {review.total_skor}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        Penilai: <strong>{isAnon ? 'Rekan Sekelas (Anonim)' : review.evaluator_name}</strong>
                      </div>

                      <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 text-xs text-slate-700 leading-relaxed italic">
                        "{review.komentar}"
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Student Fills Rubric */}
      {activeEvaluateAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block">
                  Lembar Evaluasi Antarteman
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Menilai: {activeEvaluateAssignment.evaluated_student_name}
                </h3>
              </div>
              <button onClick={() => setActiveEvaluateAssignment(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                <strong>Catatan Etika Penilaian:</strong> Berikan penilaian secara jujur, objektif, dan suportif. Tuliskan saran perbaikan dengan bahasa yang sopan.
              </div>

              {evalError && (
                <div className="p-3 text-xs bg-red-50 text-red-800 rounded-lg border border-red-200">
                  {evalError}
                </div>
              )}

              {evalSuccess && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                  {evalSuccess}
                </div>
              )}

              {/* Rubric Criteria List */}
              {(() => {
                const assessment = state.PeerAssessments.find(a => a.assessment_id === activeEvaluateAssignment.assessment_id);
                if (!assessment) return null;

                const isAlreadySubmitted = activeEvaluateAssignment.status === 'dikumpulkan';

                return (
                  <div className="space-y-4">
                    {assessment.rubrik_json.map((crit, idx) => (
                      <div key={crit.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {idx + 1}. {crit.nama_kriteria}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                            Bobot: {crit.bobot_persen}%
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          {crit.deskripsi}
                        </p>

                        <div className="pt-2 flex items-center gap-2">
                          <span className="font-semibold text-slate-700">Skor (1-5):</span>
                          {[1, 2, 3, 4, 5].map(scoreVal => (
                            <button
                              key={scoreVal}
                              type="button"
                              disabled={isAlreadySubmitted}
                              onClick={() => setEvalScores(prev => ({ ...prev, [crit.id]: scoreVal }))}
                              className={`w-9 h-9 rounded-lg font-bold text-xs transition-colors flex items-center justify-center ${
                                evalScores[crit.id] === scoreVal
                                  ? 'bg-teal-700 text-white shadow-xs'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {scoreVal}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Comment Box */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Komentar &amp; Umpan Balik Membangun *
                </label>
                <textarea
                  required
                  rows={4}
                  disabled={activeEvaluateAssignment.status === 'dikumpulkan'}
                  value={evalComment}
                  onChange={(e) => setEvalComment(e.target.value)}
                  placeholder="Contoh: Pemilihan komponen sudah sangat rapi. Pada saat perakitan, perhatikan sambungan kabel agar lebih kencang..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {activeEvaluateAssignment.status !== 'dikumpulkan' && (
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveEvaluateAssignment(null)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Penilaian Rekan</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal: Teacher Review Summary for Peer Assessment */}
      {viewSummaryAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewSummaryAssessment.judul}</h3>
                <p className="text-xs text-slate-500">Rekapitulasi Penilaian Antarteman</p>
              </div>
              <button onClick={() => setViewSummaryAssessment(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {state.PeerAssessmentAssignments.filter(p => p.assessment_id === viewSummaryAssessment.assessment_id).map(pa => (
                  <div key={pa.peer_assignment_id} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{pa.evaluator_name}</span>
                        <span className="text-slate-400">&rarr;</span>
                        <span className="font-bold text-blue-700">{pa.evaluated_student_name}</span>
                      </div>
                      {pa.komentar && (
                        <p className="text-slate-600 mt-1 italic">"{pa.komentar}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        pa.status === 'dikumpulkan' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {pa.status === 'dikumpulkan' ? `Skor: ${pa.total_skor}` : 'Belum Menilai'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewSummaryAssessment(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Teacher Create Peer Assessment */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">Buat Asesmen Praktik Antarteman</h3>
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
                      <option key={c.class_id} value={c.class_id}>{c.nama_kelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Waktu Penilaian *</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Judul Kegiatan Praktik *</label>
                <input
                  type="text"
                  required
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Penilaian Praktik Merakit Sirkuit Seri dan Paralel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Petunjuk untuk Penilai *</label>
                <textarea
                  required
                  rows={3}
                  value={formInstruksi}
                  onChange={(e) => setFormInstruksi(e.target.value)}
                  placeholder="Petunjuk bagaimana siswa mengamati unjuk kerja teman, memberikan penilaian objektif, dan kriteria kritik..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkAnon"
                  checked={formIsAnonymous}
                  onChange={(e) => setFormIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <label htmlFor="chkAnon" className="font-medium text-slate-700 cursor-pointer">
                  Penilaian Anonim (Nama penilai disembunyikan dari siswa yang dinilai)
                </label>
              </div>

              {/* Rubric editor */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Rubrik Penilaian &amp; Indikator</span>
                  <button
                    type="button"
                    onClick={handleAddCriterion}
                    className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Indikator</span>
                  </button>
                </div>

                {rubricCriteria.map((c, i) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Kriteria #{i + 1}</span>
                      {rubricCriteria.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCriterion(c.id)}
                          className="text-rose-600 hover:underline text-[11px]"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={c.nama_kriteria}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRubricCriteria(prev => prev.map(item => item.id === c.id ? { ...item, nama_kriteria: val } : item));
                        }}
                        placeholder="Nama kriteria"
                        className="col-span-2 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-500">Bobot %:</span>
                        <input
                          type="number"
                          value={c.bobot_persen}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setRubricCriteria(prev => prev.map(item => item.id === c.id ? { ...item, bobot_persen: val } : item));
                          }}
                          className="w-16 px-2 py-1 border border-slate-300 rounded bg-white text-xs tabular-nums"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={c.deskripsi}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRubricCriteria(prev => prev.map(item => item.id === c.id ? { ...item, deskripsi: val } : item));
                      }}
                      placeholder="Deskripsi tingkat kecakapan indikator..."
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                ))}
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
                  Buat &amp; Bagikan Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

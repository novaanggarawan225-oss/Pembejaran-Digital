import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  FileQuestion, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Check, 
  X, 
  Award, 
  Timer, 
  Edit3, 
  Eye, 
  HelpCircle,
  Save,
  Send
} from 'lucide-react';
import { FormativeAssessment, FormativeResponse, QuizQuestion, QuestionType } from '../types';

export const FormativeAssessmentView: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { state, createFormativeAssessment, submitFormativeResponse, gradeFormativeManual } = useData();

  const isTeacher = role === 'GURU';

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeQuizToTake, setActiveQuizToTake] = useState<FormativeAssessment | null>(null);
  const [manualGradingResponse, setManualGradingResponse] = useState<FormativeResponse | null>(null);
  const [viewResultsAssessment, setViewResultsAssessment] = useState<FormativeAssessment | null>(null);

  // Student quiz taker state
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [quizSubmitted, setQuizSubmitted] = useState<FormativeResponse | null>(null);

  // Teacher Create Quiz State
  const [formClassId, setFormClassId] = useState('');
  const [formJudul, setFormJudul] = useState('');
  const [formInstruksi, setFormInstruksi] = useState('');
  const [formDurasi, setFormDurasi] = useState(30);
  const [formTenggat, setFormTenggat] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'Q_1',
      type: 'pilihan_ganda',
      pertanyaan: 'Apakah fungsi utama klorofil dalam proses fotosintesis?',
      bobot: 25,
      pilihan: ['Menyerap energi cahaya matahari', 'Mengikat oksigen', 'Menyerap air dari tanah', 'Menghasilkan CO2'],
      kunci_jawaban: 'Menyerap energi cahaya matahari'
    },
    {
      id: 'Q_2',
      type: 'benar_salah',
      pertanyaan: 'Reaksi terang fotosintesis terjadi di grana (tilakoid) kloroplas.',
      bobot: 25,
      pilihan: ['Benar', 'Salah'],
      kunci_jawaban: 'Benar'
    },
    {
      id: 'Q_3',
      type: 'isian_singkat',
      pertanyaan: 'Produk utama fotosintesis yang disimpan sebagai cadangan makanan dalam bentuk amilum adalah...',
      bobot: 25,
      kunci_jawaban: 'glukosa'
    },
    {
      id: 'Q_4',
      type: 'uraian',
      pertanyaan: 'Jelaskan bagaimana pengaruh intensitas cahaya dan konsentrasi karbon dioksida terhadap laju fotosintesis!',
      bobot: 25,
      rubrik_uraian: 'Skor 25 jika menjelaskan hubungan sebanding intensitas cahaya hingga titik jenuh dan peran CO2 sebagai reaktan.'
    }
  ]);

  // Teacher manual grading state
  const [manualScoreInput, setManualScoreInput] = useState<number>(20);
  const [manualFeedbackInput, setManualFeedbackInput] = useState('');

  // Accessible classes
  const userClasses = state.Classes.filter(c => {
    if (isTeacher) return c.teacher_id === currentUser?.user_id;
    return state.ClassMembers.some(m => m.class_id === c.class_id && m.student_id === currentUser?.user_id && m.status === 'aktif');
  });
  const userClassIds = userClasses.map(c => c.class_id);

  // List of quizzes
  const filteredQuizzes = state.FormativeAssessments.filter(f => userClassIds.includes(f.class_id));

  // Timer countdown hook for student quiz taking
  useEffect(() => {
    let interval: any = null;
    if (activeQuizToTake && timerSeconds > 0 && !quizSubmitted) {
      interval = setInterval(() => {
        setTimerSeconds(sec => {
          if (sec <= 1) {
            clearInterval(interval);
            handleAutoSubmitOnTimeout();
            return 0;
          }
          return sec - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeQuizToTake, timerSeconds, quizSubmitted]);

  const handleStartQuiz = (quiz: FormativeAssessment) => {
    setActiveQuizToTake(quiz);
    setStudentAnswers({});
    setQuizSubmitted(null);
    setTimerSeconds(quiz.settings_json.durasi_menit * 60 || 1800);
  };

  const handleAutoSubmitOnTimeout = () => {
    if (activeQuizToTake) {
      const resp = submitFormativeResponse(activeQuizToTake.formative_id, studentAnswers);
      setQuizSubmitted(resp);
    }
  };

  const handleManualStudentSubmit = () => {
    if (!activeQuizToTake) return;
    const resp = submitFormativeResponse(activeQuizToTake.formative_id, studentAnswers);
    setQuizSubmitted(resp);
  };

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `Q_${Date.now()}`,
      type: 'pilihan_ganda',
      pertanyaan: '',
      bobot: 25,
      pilihan: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
      kunci_jawaban: 'Pilihan A'
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formClassId || !formTenggat) return;

    createFormativeAssessment({
      class_id: formClassId,
      teacher_id: currentUser?.user_id || '',
      judul: formJudul.trim(),
      instruksi: formInstruksi.trim(),
      tanggal_mulai: new Date().toISOString(),
      tenggat: new Date(formTenggat).toISOString(),
      status: 'aktif',
      settings_json: {
        durasi_menit: formDurasi,
        tampilkan_nilai_langsung: true,
        tampilkan_pembahasan: true,
        acak_soal: false
      },
      questions_json: questions
    });

    setShowCreateModal(false);
  };

  const handleSaveManualGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualGradingResponse) return;

    gradeFormativeManual(
      manualGradingResponse.response_id,
      Number(manualScoreInput),
      manualFeedbackInput.trim()
    );

    setManualGradingResponse(null);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Asesmen Formatif (Kuis Interaktif)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTeacher
              ? 'Rancang evaluasi berkala multi-tipe (Pilihan Ganda, Benar/Salah, Isian Singkat, Uraian) dengan auto-grading.'
              : 'Uji pemahaman belajarmu dengan timer pengerjaan dan penilaian langsung.'}
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => {
              setFormClassId(userClasses[0]?.class_id || '');
              setFormJudul('');
              setFormInstruksi('');
              setFormDurasi(30);
              const d = new Date();
              d.setDate(d.getDate() + 7);
              setFormTenggat(d.toISOString().slice(0, 16));
              setShowCreateModal(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Kuis Baru</span>
          </button>
        )}
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <FileQuestion className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
          <h3 className="text-sm font-bold text-slate-700">Belum ada asesmen formatif</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isTeacher 
              ? 'Buat kuis pertama untuk menguji ketercapaian tujuan pembelajaran.'
              : 'Belum ada kuis yang dijadwalkan oleh guru.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map(quiz => {
            const cls = state.Classes.find(c => c.class_id === quiz.class_id);
            const myResponse = !isTeacher
              ? state.FormativeResponses.find(r => r.formative_id === quiz.formative_id && r.student_id === currentUser?.user_id)
              : null;

            const responses = state.FormativeResponses.filter(r => r.formative_id === quiz.formative_id);
            const pendingEssayGrading = responses.filter(r => r.status === 'menunggu_pemeriksaan').length;

            return (
              <div
                key={quiz.formative_id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-blue-700 truncate max-w-[160px]">
                      {cls?.nama_kelas}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Timer className="w-3.5 h-3.5" />
                      <span>{quiz.settings_json.durasi_menit} Menit</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                      {quiz.judul}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {quiz.instruksi}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Jumlah Soal:</span>
                    <span className="font-semibold">{quiz.questions_json.length} Pertanyaan</span>
                  </div>

                  {/* Student result preview */}
                  {!isTeacher && myResponse && (
                    <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-teal-900">Nilai Kuis:</span>
                      <span className="font-bold text-base text-teal-800 tabular-nums">
                        {myResponse.total_nilai}
                        {myResponse.status === 'menunggu_pemeriksaan' && (
                          <span className="text-[10px] text-amber-700 block font-normal">
                            (Menunggu Uraian)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Teacher pending grading note */}
                  {isTeacher && pendingEssayGrading > 0 && (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{pendingEssayGrading} jawaban uraian perlu dinilai manual</span>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  {isTeacher ? (
                    <button
                      onClick={() => setViewResultsAssessment(quiz)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rekap Nilai ({responses.length} Siswa)</span>
                    </button>
                  ) : (
                    <div>
                      {myResponse ? (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Telah Dikerjakan</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Mulai Kerjakan</span>
                        </button>
                      )}
                    </div>
                  )}

                  <span className="text-[11px] text-slate-400">
                    Tenggat: {new Date(quiz.tenggat).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Interactive Student Quiz Taker */}
      {activeQuizToTake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Quiz Header with Timer */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-teal-900 text-white">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider block">
                  Asesmen Formatif Mandiri
                </span>
                <h2 className="text-base font-bold truncate max-w-md">{activeQuizToTake.judul}</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs flex items-center gap-1.5 shadow-inner ${
                  timerSeconds < 300 ? 'bg-rose-600 text-white animate-pulse' : 'bg-teal-800 text-teal-100'
                }`}>
                  <Timer className="w-4 h-4" />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>
                <button
                  onClick={() => setActiveQuizToTake(null)}
                  className="p-1 text-teal-300 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quiz Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800 flex-1">
              {quizSubmitted ? (
                /* Result Screen */
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Kuis Berhasil Dikirimkan!</h3>
                    <p className="text-xs text-slate-500 mt-1">Jawaban Anda telah tersimpan ke sistem.</p>
                  </div>

                  <div className="p-5 max-w-sm mx-auto bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="text-xs text-slate-500">Skor Objektif Otomatis:</div>
                    <div className="text-3xl font-extrabold text-teal-700 tabular-nums font-mono">
                      {quizSubmitted.nilai_otomatis}
                    </div>
                    {quizSubmitted.status === 'menunggu_pemeriksaan' && (
                      <p className="text-[11px] text-amber-700 font-medium">
                        * Terdapat soal uraian yang sedang menunggu penilaian manual dari guru.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveQuizToTake(null)}
                    className="px-6 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors"
                  >
                    Selesai &amp; Kembali ke Menu
                  </button>
                </div>
              ) : (
                /* Question List */
                <div className="space-y-6">
                  {activeQuizToTake.questions_json.map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                        <span className="font-bold text-slate-900">
                          Pertanyaan {idx + 1} ({q.type.replace('_', ' ').toUpperCase()})
                        </span>
                        <span className="text-[11px] font-semibold text-teal-700 tabular-nums">
                          Bobot: {q.bobot} Poin
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-800 leading-relaxed">
                        {q.pertanyaan}
                      </p>

                      {/* Options based on Question Type */}
                      {q.type === 'pilihan_ganda' && q.pilihan && (
                        <div className="space-y-2 pt-1">
                          {q.pilihan.map((opt, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                studentAnswers[q.id] === opt
                                  ? 'bg-teal-50/80 border-teal-500 font-semibold text-teal-900 shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                checked={studentAnswers[q.id] === opt}
                                onChange={() => setStudentAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-xs">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {q.type === 'benar_salah' && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          {['Benar', 'Salah'].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setStudentAnswers(prev => ({ ...prev, [q.id]: val }))}
                              className={`py-2.5 px-4 rounded-lg font-bold text-xs transition-colors border ${
                                studentAnswers[q.id] === val
                                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      )}

                      {q.type === 'isian_singkat' && (
                        <div className="pt-1">
                          <input
                            type="text"
                            value={studentAnswers[q.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStudentAnswers(prev => ({ ...prev, [q.id]: val }));
                            }}
                            placeholder="Ketik jawaban singkat Anda di sini..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                          />
                        </div>
                      )}

                      {q.type === 'uraian' && (
                        <div className="pt-1">
                          <textarea
                            rows={4}
                            value={studentAnswers[q.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStudentAnswers(prev => ({ ...prev, [q.id]: val }));
                            }}
                            placeholder="Tuliskan uraian dan penjelasan Anda secara rinci..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quiz Footer */}
            {!quizSubmitted && (
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50">
                <span className="text-xs text-slate-500">
                  Terjawab: {Object.keys(studentAnswers).length} dari {activeQuizToTake.questions_json.length} soal
                </span>
                <button
                  type="button"
                  onClick={handleManualStudentSubmit}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Lembar Jawaban Kuis</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Teacher Grades Student Essay Responses */}
      {manualGradingResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                Pemeriksaan Uraian: {manualGradingResponse.student_name}
              </h3>
              <button onClick={() => setManualGradingResponse(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualGrading} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-700 block">Jawaban Uraian Siswa:</span>
                {Object.entries(manualGradingResponse.answers_json).map(([qid, ans]) => (
                  <div key={qid} className="text-slate-700">
                    <span className="font-mono text-slate-500 block text-[10px]">{qid}</span>
                    <p className="italic bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
                      "{ans}"
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nilai Soal Uraian Manual *
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  required
                  value={manualScoreInput}
                  onChange={(e) => setManualScoreInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Nilai otomatis sebelumnya: {manualGradingResponse.nilai_otomatis}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Umpan Balik Guru
                </label>
                <textarea
                  rows={3}
                  value={manualFeedbackInput}
                  onChange={(e) => setManualFeedbackInput(e.target.value)}
                  placeholder="Catatan koreksi jawaban uraian..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManualGradingResponse(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
                >
                  Simpan Nilai Manual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Teacher View Results List for Quiz */}
      {viewResultsAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewResultsAssessment.judul}</h3>
                <p className="text-xs text-slate-500">Rekap Hasil Kuis Formatif Siswa</p>
              </div>
              <button onClick={() => setViewResultsAssessment(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {state.FormativeResponses.filter(r => r.formative_id === viewResultsAssessment.formative_id).map(resp => (
                  <div key={resp.response_id} className="p-4 bg-white flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900">{resp.student_name}</div>
                      <div className="text-[11px] text-slate-500">
                        Otomatis: {resp.nilai_otomatis} &middot; Manual: {resp.nilai_manual || 0}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-blue-700 tabular-nums">
                        Total: {resp.total_nilai}
                      </span>
                      {resp.status === 'menunggu_pemeriksaan' && (
                        <button
                          onClick={() => {
                            setManualGradingResponse(resp);
                            setManualScoreInput(resp.nilai_manual || 15);
                            setManualFeedbackInput(resp.feedback || '');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg"
                        >
                          Periksa Uraian
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewResultsAssessment(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Teacher Create Formative Quiz */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">Buat Asesmen Formatif Baru</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block font-semibold text-slate-700 mb-1">Durasi Timer (Menit)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={formDurasi}
                    onChange={(e) => setFormDurasi(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
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
                <label className="block font-semibold text-slate-700 mb-1">Judul Kuis Formatif *</label>
                <input
                  type="text"
                  required
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Kuis Formatif 2: Fotosintesis & Reaksi Terang"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instruksi Pengerjaan *</label>
                <input
                  type="text"
                  value={formInstruksi}
                  onChange={(e) => setFormInstruksi(e.target.value)}
                  placeholder="Kerjakan secara mandiri dengan teliti sebelum waktu habis..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Questions Builder */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Daftar Pertanyaan ({questions.length})</span>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Soal</span>
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Nomor {idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const t = e.target.value as QuestionType;
                            setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, type: t } : item));
                          }}
                          className="px-2 py-1 border border-slate-300 rounded bg-white text-xs font-medium"
                        >
                          <option value="pilihan_ganda">Pilihan Ganda</option>
                          <option value="benar_salah">Benar / Salah</option>
                          <option value="isian_singkat">Isian Singkat</option>
                          <option value="uraian">Uraian / Essay</option>
                        </select>
                        <input
                          type="number"
                          value={q.bobot}
                          onChange={(e) => {
                            const b = Number(e.target.value);
                            setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, bobot: b } : item));
                          }}
                          className="w-14 px-2 py-1 border border-slate-300 rounded bg-white text-xs text-center tabular-nums"
                          title="Bobot Nilai"
                        />
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="text-rose-600 hover:underline text-[11px]"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={q.pertanyaan}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, pertanyaan: val } : item));
                      }}
                      placeholder="Tuliskan teks pertanyaan soal..."
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    />

                    {/* Key answer input */}
                    {q.type !== 'uraian' && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-emerald-800">Kunci Jawaban:</span>
                        <input
                          type="text"
                          value={String(q.kunci_jawaban || '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, kunci_jawaban: val } : item));
                          }}
                          placeholder="Kunci jawaban persis..."
                          className="flex-1 px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                    )}
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
                  Simpan &amp; Buka Kuis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

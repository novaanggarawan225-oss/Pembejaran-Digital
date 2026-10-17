import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { exportToCsv } from '../services/api';
import { 
  Sparkles, 
  Send, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Smile, 
  Meh, 
  Frown, 
  HelpCircle,
  X,
  FileSpreadsheet,
  Flag
} from 'lucide-react';
import { Reflection } from '../types';

export const ReflectionsView: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { state, submitReflection, updateReflectionTeacherNotes } = useData();

  const isTeacher = role === 'GURU';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [onlyNeedAttention, setOnlyNeedAttention] = useState(false);

  // Student reflection form
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [scaleRating, setScaleRating] = useState<number>(4);
  const [ansUnderstood, setAnsUnderstood] = useState('');
  const [ansDifficult, setAnsDifficult] = useState('');
  const [ansImprove, setAnsImprove] = useState('');
  const [needHelpChoice, setNeedHelpChoice] = useState('Tidak, sudah jelas');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Teacher note modal
  const [activeReflectionForNote, setActiveReflectionForNote] = useState<Reflection | null>(null);
  const [teacherNoteInput, setTeacherNoteInput] = useState('');
  const [flagNeedAttention, setFlagNeedAttention] = useState(false);

  // Accessible classes
  const userClasses = state.Classes.filter(c => {
    if (isTeacher) return c.teacher_id === currentUser?.user_id;
    return state.ClassMembers.some(m => m.class_id === c.class_id && m.student_id === currentUser?.user_id && m.status === 'aktif');
  });
  const userClassIds = userClasses.map(c => c.class_id);

  // Filter reflections
  const filteredReflections = state.Reflections.filter(r => {
    if (!userClassIds.includes(r.class_id)) return false;
    // Murid only sees their own reflections!
    if (!isTeacher && r.student_id !== currentUser?.user_id) return false;

    if (selectedClassFilter !== 'all' && r.class_id !== selectedClassFilter) return false;
    if (onlyNeedAttention && !r.needs_attention) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (r.student_name || '').toLowerCase().includes(q);
      const matchMat = (r.material_title || '').toLowerCase().includes(q);
      return matchName || matchMat;
    }
    return true;
  }).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;

    const targetClass = state.Classes.find(c => c.class_id === selectedClassId);
    const targetMat = state.Materials.find(m => m.material_id === selectedMaterialId);

    submitReflection({
      class_id: selectedClassId,
      material_id: selectedMaterialId || undefined,
      material_title: targetMat?.judul || 'Pertemuan Kelas',
      student_id: currentUser?.user_id || '',
      student_name: currentUser?.nama || '',
      questions_json: [
        { id: 'RQ_1', type: 'skala_5', pertanyaan: 'Seberapa yakin kamu memahami materi pembelajaran?' },
        { id: 'RQ_2', type: 'teks', pertanyaan: 'Bagian konsep mana yang paling kamu pahami dan menarik?' },
        { id: 'RQ_3', type: 'teks', pertanyaan: 'Bagian konsep mana yang masih terasa rumit atau sulit?' },
        { id: 'RQ_4', type: 'teks', pertanyaan: 'Apa yang ingin kamu perbaiki pada pembelajaran berikutnya?' },
        { id: 'RQ_5', type: 'pilihan', pertanyaan: 'Apakah kamu memerlukan bimbingan tambahan dari guru?' }
      ],
      answers_json: {
        RQ_1: scaleRating,
        RQ_2: ansUnderstood.trim(),
        RQ_3: ansDifficult.trim(),
        RQ_4: ansImprove.trim(),
        RQ_5: needHelpChoice
      },
      needs_attention: scaleRating <= 2 || needHelpChoice.includes('privat')
    });

    setSubmitSuccess(true);
    setAnsUnderstood('');
    setAnsDifficult('');
    setAnsImprove('');
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handleSaveTeacherNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReflectionForNote) return;

    updateReflectionTeacherNotes(
      activeReflectionForNote.reflection_id,
      teacherNoteInput.trim(),
      flagNeedAttention
    );

    setActiveReflectionForNote(null);
  };

  const handleExportCsv = () => {
    const exportData = filteredReflections.map(r => ({
      ID: r.reflection_id,
      Siswa: r.student_name,
      Kelas: state.Classes.find(c => c.class_id === r.class_id)?.nama_kelas,
      Materi: r.material_title,
      Skala_Pemahaman: r.answers_json.RQ_1,
      Konsep_Dipahami: r.answers_json.RQ_2,
      Konsep_Sulit: r.answers_json.RQ_3,
      Rencana_Perbaikan: r.answers_json.RQ_4,
      Bantuan_Guru: r.answers_json.RQ_5,
      Perlu_Tindak_Lanjut: r.needs_attention ? 'YA' : 'TIDAK',
      Catatan_Guru: r.teacher_notes || '',
      Tanggal: r.submitted_at
    }));

    exportToCsv(exportData, 'Rekap_Refleksi_Pembelajaran');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Refleksi Pembelajaran
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTeacher
              ? 'Analisis pola pemahaman murid, identifikasi topik sulit, dan tandai murid yang memerlukan bimbingan.'
              : 'Tuliskan evaluasi diri secara jujur dan berkala untuk meningkatkan kualitas belajarmu.'}
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-center"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Rekap Refleksi (CSV)</span>
          </button>
        )}
      </div>

      {/* ---------------- MURID VIEW: SUBMIT NEW REFLECTION ---------------- */}
      {!isTeacher && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Formulir Refleksi Belajar Mandiri</h2>
              <p className="text-xs text-slate-500">Privasi Terjaga: Refleksi ini hanya dapat dibaca oleh Anda dan Guru Pengajar.</p>
            </div>
          </div>

          {submitSuccess && (
            <div className="p-3 text-xs bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Refleksi pembelajaran berhasil disimpan! Terima kasih atas kejujuran dan keterbukaannya.</span>
            </div>
          )}

          <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Kelas *</label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedMaterialId('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  <option value="">-- Pilih Kelas Pembelajaran --</option>
                  {userClasses.map(c => (
                    <option key={c.class_id} value={c.class_id}>{c.nama_kelas}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Materi / Topik Terkait (Opsional)</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  <option value="">Pertemuan Kelas Umum</option>
                  {state.Materials.filter(m => m.class_id === selectedClassId && m.status === 'terbit').map(m => (
                    <option key={m.material_id} value={m.material_id}>{m.judul}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scale rating (1 - 5) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block font-semibold text-slate-800">
                Seberapa yakin kamu memahami materi pembelajaran hari ini? (Skala 1 - 5) *
              </label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setScaleRating(rating)}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex flex-col items-center gap-1 transition-all border ${
                      scaleRating === rating
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-sm">
                      {rating === 1 ? '😟' : rating === 2 ? '😕' : rating === 3 ? '😐' : rating === 4 ? '🙂' : '😄'}
                    </span>
                    <span>Skala {rating}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bagian konsep mana yang paling kamu pahami dan menarik? *
              </label>
              <textarea
                required
                rows={2}
                value={ansUnderstood}
                onChange={(e) => setAnsUnderstood(e.target.value)}
                placeholder="Contoh: Saya paling paham saat menghitung rumus Hukum Ohm..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bagian konsep mana yang masih terasa sulit atau membingungkan? *
              </label>
              <textarea
                required
                rows={2}
                value={ansDifficult}
                onChange={(e) => setAnsDifficult(e.target.value)}
                placeholder="Contoh: Saya masih bingung membedakan rangkaian seri dan paralel saat bentuknya bercabang..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Apa yang ingin kamu perbaiki pada pertemuan berikutnya?
                </label>
                <input
                  type="text"
                  value={ansImprove}
                  onChange={(e) => setAnsImprove(e.target.value)}
                  placeholder="Contoh: Lebih banyak membaca modul sebelum kelas..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Apakah kamu memerlukan bantuan atau bimbingan dari guru? *
                </label>
                <select
                  value={needHelpChoice}
                  onChange={(e) => setNeedHelpChoice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  <option value="Tidak, sudah jelas">Tidak, materi sudah cukup jelas</option>
                  <option value="Perlu penjelasan singkat di kelas">Perlu penjelasan singkat di kelas berikutnya</option>
                  <option value="Perlu bimbingan privat">Perlu klinik / bimbingan khusus dari guru</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Refleksi Saya</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- GURU VIEW: REFLECTION INSIGHTS & RESPONSES ---------------- */}
      {isTeacher && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama murid atau materi..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Kelas:</span>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">Semua Kelas</option>
                  {userClasses.map(c => (
                    <option key={c.class_id} value={c.class_id}>{c.nama_kelas}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={onlyNeedAttention}
                  onChange={(e) => setOnlyNeedAttention(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded border-slate-300"
                />
                <span>Hanya Perlu Tindak Lanjut</span>
              </label>

              <span className="text-slate-400 tabular-nums ml-auto">
                {filteredReflections.length} respons
              </span>
            </div>
          </div>

          {/* Reflections List */}
          {filteredReflections.length === 0 ? (
            <div className="py-14 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              Tidak ada catatan refleksi yang cocok dengan filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReflections.map(ref => {
                const cls = state.Classes.find(c => c.class_id === ref.class_id);
                const scaleVal = Number(ref.answers_json.RQ_1 || 4);

                return (
                  <div
                    key={ref.reflection_id}
                    className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-3 transition-colors ${
                      ref.needs_attention ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{ref.student_name}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {cls?.nama_kelas} &middot; {ref.material_title || 'Pertemuan Kelas'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold tabular-nums ${
                          scaleVal <= 2 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          Skala {scaleVal}/5
                        </span>
                        {ref.needs_attention && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                            Perlu Bantuan
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-emerald-800 block text-[11px]">Konsep yang Dipahami:</span>
                        <p className="text-slate-700 italic">"{ref.answers_json.RQ_2}"</p>
                      </div>
                      <div>
                        <span className="font-semibold text-rose-800 block text-[11px]">Konsep yang Masih Sulit:</span>
                        <p className="text-slate-700 italic">"{ref.answers_json.RQ_3}"</p>
                      </div>
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        Permintaan Bimbingan: <strong>{String(ref.answers_json.RQ_5 || 'Tidak')}</strong>
                      </div>
                    </div>

                    {ref.teacher_notes && (
                      <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-blue-900">
                        <span className="font-bold block text-[10px] uppercase text-blue-700">Catatan Tindak Lanjut Guru:</span>
                        <p>{ref.teacher_notes}</p>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        {new Date(ref.submitted_at).toLocaleDateString('id-ID')}
                      </span>
                      <button
                        onClick={() => {
                          setActiveReflectionForNote(ref);
                          setTeacherNoteInput(ref.teacher_notes || '');
                          setFlagNeedAttention(!!ref.needs_attention);
                        }}
                        className="font-semibold text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>{ref.teacher_notes ? 'Ubah Catatan Bimbingan' : 'Beri Catatan Tindak Lanjut'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Teacher Add Note / Flag Attention */}
      {activeReflectionForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                Tindak Lanjut Refleksi: {activeReflectionForNote.student_name}
              </h3>
              <button onClick={() => setActiveReflectionForNote(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacherNote} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Intervensi / Jadwal Klinik Guru
                </label>
                <textarea
                  rows={3}
                  value={teacherNoteInput}
                  onChange={(e) => setTeacherNoteInput(e.target.value)}
                  placeholder="Contoh: Dijadwalkan bimbingan rumus rangkaian campuran pada hari Kamis jam istirahat..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chkFlag"
                  checked={flagNeedAttention}
                  onChange={(e) => setFlagNeedAttention(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300"
                />
                <label htmlFor="chkFlag" className="font-semibold text-slate-700 cursor-pointer">
                  Tandai siswa ini memerlukan perhatian khusus
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveReflectionForNote(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

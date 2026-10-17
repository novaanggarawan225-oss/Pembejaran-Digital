import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { exportToCsv } from '../services/api';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Award, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { state } = useData();

  const isTeacher = role === 'GURU';

  // Filters
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Accessible classes
  const userClasses = state.Classes.filter(c => {
    if (isTeacher) return c.teacher_id === currentUser?.user_id;
    return state.ClassMembers.some(m => m.class_id === c.class_id && m.student_id === currentUser?.user_id && m.status === 'aktif');
  });
  const userClassIds = userClasses.map(c => c.class_id);

  // Student filter for teacher (if teacher wants to inspect individual student report card)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  // Compile Gradebook Data for Teacher
  const compiledRows = React.useMemo(() => {
    const rows: Array<{
      studentId: string;
      studentName: string;
      studentNisn: string;
      classId: string;
      className: string;
      totalTasks: number;
      submittedTasks: number;
      avgTaskScore: number;
      quizScore: number;
      peerScore: number;
      finalScore: number;
    }> = [];

    // Filter target classes
    const classesToProcess = selectedClassFilter === 'all'
      ? userClasses
      : userClasses.filter(c => c.class_id === selectedClassFilter);

    classesToProcess.forEach(cls => {
      const members = state.ClassMembers.filter(m => m.class_id === cls.class_id && m.status === 'aktif');
      const classAssignments = state.Assignments.filter(a => a.class_id === cls.class_id && a.status === 'dipublikasikan');
      const classQuizzes = state.FormativeAssessments.filter(f => f.class_id === cls.class_id);

      members.forEach(mbr => {
        if (!isTeacher && mbr.student_id !== currentUser?.user_id) return; // student privacy!
        if (isTeacher && selectedStudentId !== 'all' && mbr.student_id !== selectedStudentId) return;

        const studentUser = state.Users.find(u => u.user_id === mbr.student_id);

        // Assignment Submissions & Avg Score
        const subs = state.Submissions.filter(
          s => classAssignments.some(a => a.assignment_id === s.assignment_id) &&
               s.student_id === mbr.student_id &&
               s.nilai !== null && s.nilai !== undefined
        );
        const avgTask = subs.length > 0 
          ? Math.round(subs.reduce((acc, cur) => acc + (cur.nilai || 0), 0) / subs.length)
          : 0;

        // Formative Quiz Avg
        const quizResponses = state.FormativeResponses.filter(
          r => classQuizzes.some(q => q.formative_id === r.formative_id) && r.student_id === mbr.student_id
        );
        const avgQuiz = quizResponses.length > 0
          ? Math.round(quizResponses.reduce((acc, cur) => acc + cur.total_nilai, 0) / quizResponses.length)
          : 0;

        // Peer Assessment Avg (as evaluated student)
        const peerReviews = state.PeerAssessmentAssignments.filter(
          pa => pa.evaluated_student_id === mbr.student_id && pa.status === 'dikumpulkan' && pa.total_skor !== undefined
        );
        const avgPeer = peerReviews.length > 0
          ? Math.round(peerReviews.reduce((acc, cur) => acc + (cur.total_skor || 0), 0) / peerReviews.length)
          : 0;

        // Weighted Final Grade: 50% Tasks + 30% Quizzes + 20% Peer Practices
        const finalGrade = Math.round(avgTask * 0.5 + avgQuiz * 0.3 + (avgPeer || avgTask) * 0.2);

        rows.push({
          studentId: mbr.student_id,
          studentName: mbr.student_name || 'Siswa',
          studentNisn: studentUser?.nisn_nip || '-',
          classId: cls.class_id,
          className: cls.nama_kelas,
          totalTasks: classAssignments.length,
          submittedTasks: subs.length,
          avgTaskScore: avgTask,
          quizScore: avgQuiz,
          peerScore: avgPeer,
          finalScore: finalGrade
        });
      });
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return rows.filter(r => r.studentName.toLowerCase().includes(q) || r.className.toLowerCase().includes(q));
    }

    return rows;
  }, [userClasses, selectedClassFilter, selectedStudentId, isTeacher, currentUser, state, searchQuery]);

  const handleExportCsv = () => {
    const csvData = compiledRows.map(row => ({
      NISN: row.studentNisn,
      Nama_Siswa: row.studentName,
      Kelas: row.className,
      Tugas_Dikumpulkan: `${row.submittedTasks}/${row.totalTasks}`,
      Rata_Tugas: row.avgTaskScore,
      Rata_Kuis: row.quizScore,
      Rata_Praktik_Teman: row.peerScore,
      Nilai_Akhir: row.finalScore,
      Predikat: row.finalScore >= 90 ? 'A (Sangat Baik)' : row.finalScore >= 80 ? 'B (Baik)' : row.finalScore >= 70 ? 'C (Cukup)' : 'D (Perlu Bimbingan)'
    }));

    exportToCsv(csvData, `Rekap_Nilai_Kelas_Digital_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isTeacher ? 'Nilai dan Laporan Hasil Belajar' : 'Laporan Capaian Belajar Saya'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTeacher
              ? 'Rekapitulasi nilai tugas, kuis formatif, asesmen praktik antarteman, dan cetak rapor digital.'
              : 'Pantau akumulasi nilai tugas, evaluasi kuis, dan umpan balik teman sekelas.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rapor Digital</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (hidden on print) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs no-print">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama murid atau kelas..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Pilih Kelas:</span>
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
            {compiledRows.length} entri data
          </span>
        </div>
      </div>

      {/* Printable Report Header (Visible only when printed or in preview) */}
      <div className="hidden print:block p-6 bg-white border-b-2 border-slate-800 text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">
          SMP NEGERI 1 DIGITAL NUSANTARA
        </h2>
        <p className="text-xs text-slate-600">
          Laporan Rekapitulasi Pembelajaran Digital Siswa &middot; Tahun Ajaran 2025/2026 Genap
        </p>
        <p className="text-[10px] text-slate-400 mt-1 font-mono">
          Dicetak pada: {new Date().toLocaleString('id-ID')}
        </p>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4 text-center">Ketuntasan Tugas</th>
                <th className="py-3.5 px-4 text-right">Rata Tugas (50%)</th>
                <th className="py-3.5 px-4 text-right">Rata Kuis (30%)</th>
                <th className="py-3.5 px-4 text-right">Praktik Rekan (20%)</th>
                <th className="py-3.5 px-4 text-right font-bold text-slate-900">Nilai Akhir</th>
                <th className="py-3.5 px-4 text-center">Predikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {compiledRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data nilai yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                compiledRows.map((row, idx) => {
                  const completionRate = row.totalTasks > 0 ? Math.round((row.submittedTasks / row.totalTasks) * 100) : 100;
                  const predikat = row.finalScore >= 90 ? 'A' : row.finalScore >= 80 ? 'B' : row.finalScore >= 70 ? 'C' : 'D';

                  return (
                    <tr key={`${row.studentId}_${row.classId}_${idx}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {row.studentName}
                        <span className="block text-[10px] text-slate-400 font-mono font-normal">
                          NISN: {row.studentNisn}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {row.className}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-mono tabular-nums">{row.submittedTasks}/{row.totalTasks}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            completionRate === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {row.avgTaskScore}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {row.quizScore}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {row.peerScore || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-sm text-blue-700 tabular-nums">
                        {row.finalScore}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          predikat === 'A' ? 'bg-emerald-100 text-emerald-800' :
                          predikat === 'B' ? 'bg-blue-100 text-blue-800' :
                          predikat === 'C' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {predikat}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

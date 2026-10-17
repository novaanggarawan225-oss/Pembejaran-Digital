import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  BookOpen, 
  Users, 
  CheckSquare, 
  Clock, 
  MailCheck, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  LogIn
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenCreateClass?: () => void;
  onOpenJoinClass?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onNavigate,
  onOpenCreateClass,
  onOpenJoinClass
}) => {
  const { currentUser, role } = useAuth();
  const { state } = useData();

  if (role === 'GURU') {
    // ---------------- TEACHER DASHBOARD ---------------- //
    const myClasses = state.Classes.filter(c => c.teacher_id === currentUser?.user_id && c.status === 'aktif');
    const myClassIds = myClasses.map(c => c.class_id);

    const totalStudents = state.ClassMembers.filter(
      m => myClassIds.includes(m.class_id) && m.status === 'aktif'
    ).length;

    const myAssignments = state.Assignments.filter(
      a => myClassIds.includes(a.class_id) && a.status === 'dipublikasikan'
    );

    const pendingGradingSubmissions = state.Submissions.filter(
      s => (s.status === 'dikumpulkan' || s.status === 'sedang_dinilai') &&
        myAssignments.some(a => a.assignment_id === s.assignment_id)
    );

    const pendingLeaves = state.LeaveRequests.filter(
      l => myClassIds.includes(l.class_id) && l.status === 'menunggu'
    );

    const recentAuditLogs = state.AuditLogs.slice(0, 5);

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-blue-300 font-semibold mb-1">
              Dashboard Pendidik &middot; KELAS DIGITAL
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Selamat datang kembali, {currentUser?.nama}!
            </h1>
            <p className="text-sm text-blue-200 mt-1 max-w-xl">
              Pantau progres belajar murid, tinjau tugas yang belum dinilai, dan periksa pengajuan surat izin secara terstruktur.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('classes')}
              className="px-4 py-2 text-xs font-semibold bg-white text-slate-900 rounded-lg hover:bg-blue-50 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Kelola Kelas</span>
            </button>
            <button
              onClick={() => onNavigate('assignments')}
              className="px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Buat Tugas</span>
            </button>
          </div>
        </div>

        {/* 5 Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Kelas Diajar</span>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{myClasses.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Kelas aktif semester ini</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Total Murid</span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{totalStudents}</div>
            <div className="text-[11px] text-slate-400 mt-1">Terdaftar di semua kelas</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Tugas Aktif</span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{myAssignments.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Sedang berlangsung</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Belum Dinilai</span>
              <CheckSquare className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700 tabular-nums">{pendingGradingSubmissions.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Perlu pemeriksaan guru</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Izin Menunggu</span>
              <MailCheck className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-700 tabular-nums">{pendingLeaves.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Perlu konfirmasi guru</div>
          </div>
        </div>

        {/* Action Queues: Pending Leaves & Unchecked Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unreviewed Leaves Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MailCheck className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900">Pengajuan Surat Izin Menunggu</h3>
                </div>
                <button
                  onClick={() => onNavigate('leave_requests')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 divide-y divide-slate-100">
                {pendingLeaves.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                    <span>Tidak ada pengajuan surat izin yang menunggu persetujuan.</span>
                  </div>
                ) : (
                  pendingLeaves.slice(0, 3).map(leave => (
                    <div key={leave.leave_id} className="py-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{leave.student_name}</div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          Jenis: {leave.jenis_izin.replace('_', ' ')} &middot; {leave.tanggal_mulai} s.d {leave.tanggal_selesai}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                          "{leave.alasan}"
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('leave_requests')}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 shrink-0"
                      >
                        Periksa
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Submissions Waiting for Grading */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Jawaban Tugas Siap Dinilai</h3>
                </div>
                <button
                  onClick={() => onNavigate('assignments')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <span>Buka Tugas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 divide-y divide-slate-100">
                {pendingGradingSubmissions.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                    <span>Semua tugas siswa yang masuk telah dinilai.</span>
                  </div>
                ) : (
                  pendingGradingSubmissions.slice(0, 3).map(sub => {
                    const task = state.Assignments.find(a => a.assignment_id === sub.assignment_id);
                    return (
                      <div key={sub.submission_id} className="py-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{sub.student_name}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {task?.judul || 'Tugas'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Dikumpulkan: {new Date(sub.submitted_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate('assignments')}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 rounded-lg hover:bg-amber-100 shrink-0"
                        >
                          Beri Nilai
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Classes Overview Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daftar Kelas Aktif</h3>
              <p className="text-xs text-slate-500">Kelas yang Anda ampu pada tahun ajaran ini</p>
            </div>
            <button
              onClick={() => onNavigate('classes')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>Semua Kelas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {myClasses.map(cls => {
              const memberCount = state.ClassMembers.filter(m => m.class_id === cls.class_id && m.status === 'aktif').length;
              return (
                <div 
                  key={cls.class_id}
                  onClick={() => onNavigate('classes')}
                  className="group p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-blue-700">{cls.mata_pelajaran}</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                        Kode: {cls.kode_kelas}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {cls.nama_kelas}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {cls.deskripsi}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span>{memberCount} Siswa Terdaftar</span>
                    <span className="text-blue-600 font-semibold group-hover:underline">Buka &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- STUDENT DASHBOARD ---------------- //
  const myMemberships = state.ClassMembers.filter(
    m => m.student_id === currentUser?.user_id && m.status === 'aktif'
  );
  const myClassIds = myMemberships.map(m => m.class_id);
  const myClasses = state.Classes.filter(c => myClassIds.includes(c.class_id));

  // Assignments for enrolled classes
  const activeAssignments = state.Assignments.filter(
    a => myClassIds.includes(a.class_id) && a.status === 'dipublikasikan'
  );

  // Student submissions
  const mySubmissions = state.Submissions.filter(s => s.student_id === currentUser?.user_id);

  // Unfinished assignments
  const pendingTasks = activeAssignments.filter(a => {
    const sub = mySubmissions.find(s => s.assignment_id === a.assignment_id);
    return !sub || sub.status === 'draf' || sub.status === 'perlu_revisi';
  });

  // Recent materials
  const recentMaterials = state.Materials.filter(
    m => myClassIds.includes(m.class_id) && m.status === 'terbit'
  ).slice(0, 3);

  // Peer assignments
  const pendingPeer = state.PeerAssessmentAssignments.filter(
    pa => pa.evaluator_id === currentUser?.user_id && pa.status === 'belum'
  );

  // Formative Quizzes
  const activeQuizzes = state.FormativeAssessments.filter(
    f => myClassIds.includes(f.class_id) && f.status === 'aktif'
  );

  // Leaves
  const myLeaves = state.LeaveRequests.filter(l => l.student_id === currentUser?.user_id);

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-teal-300 font-semibold mb-1">
            Dashboard Murid &middot; KELAS DIGITAL
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Halo, {currentUser?.nama}!
          </h1>
          <p className="text-sm text-teal-200 mt-1 max-w-xl">
            Semangat belajar! Cek tenggat tugas terdekat, pelajari materi baru, dan tuntaskan asesmen kelasmu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('classes')}
            className="px-4 py-2 text-xs font-semibold bg-white text-teal-900 rounded-lg hover:bg-teal-50 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Gabung Kelas Baru</span>
          </button>
          <button
            onClick={() => onNavigate('assignments')}
            className="px-4 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-600 text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Kerjakan Tugas</span>
          </button>
        </div>
      </div>

      {/* Student 4 Metric Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Kelas Diikuti</span>
            <BookOpen className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{myClasses.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Kelas aktif</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tugas Belum Selesai</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 tabular-nums">{pendingTasks.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Menunggu pengumpulan</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Asesmen Teman</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{pendingPeer.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Perlu dinilai olehmu</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Surat Izin Saya</span>
            <MailCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{myLeaves.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Riwayat pengajuan izin</div>
        </div>
      </div>

      {/* Main Student Section: Urgent Tasks & Recent Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Tasks (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Tugas yang Harus Segera Dikerjakan</h3>
            </div>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
            >
              <span>Semua Tugas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {pendingTasks.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs space-y-1">
                <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-500" />
                <p className="font-medium text-slate-700">Semua tugas sudah kamu kumpulkan!</p>
                <p>Pertahankan kedisiplinan belajarmu.</p>
              </div>
            ) : (
              pendingTasks.map(task => {
                const cls = state.Classes.find(c => c.class_id === task.class_id);
                const isOverdue = new Date() > new Date(task.tenggat);
                return (
                  <div key={task.assignment_id} className="py-3.5 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-medium text-teal-700">{cls?.nama_kelas || 'Kelas'}</span>
                        <span>&middot;</span>
                        <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                          Tenggat: {new Date(task.tenggat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {isOverdue && ' (Terlambat)'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{task.judul}</h4>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{task.instruksi}</p>
                    </div>
                    <button
                      onClick={() => onNavigate('assignments')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors shrink-0"
                    >
                      Kirim Jawaban
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right side: Classes List & Quick Peer Assessment */}
        <div className="space-y-6">
          {/* Peer Assessment Reminder */}
          {pendingPeer.length > 0 && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                <Users className="w-4 h-4 text-blue-700" />
                <span>Asesmen Antarteman Menunggu</span>
              </div>
              <p className="text-xs text-blue-800">
                Kamu memiliki {pendingPeer.length} unjuk kerja teman yang perlu dinilai berdasarkan rubrik guru.
              </p>
              <button
                onClick={() => onNavigate('peer_assessments')}
                className="mt-2.5 px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors w-full"
              >
                Isi Penilaian Rekan &rarr;
              </button>
            </div>
          )}

          {/* Enrolled Classes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Kelas Saya</h3>
              <button
                onClick={() => onNavigate('classes')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
              >
                Gabung
              </button>
            </div>
            <div className="mt-3 space-y-2.5">
              {myClasses.map(c => (
                <div key={c.class_id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="text-xs font-bold text-slate-900">{c.nama_kelas}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Pengampu: {c.teacher_name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

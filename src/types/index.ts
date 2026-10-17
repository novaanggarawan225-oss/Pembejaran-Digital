export type UserRole = 'GURU' | 'MURID';

export interface User {
  user_id: string;
  nama: string;
  email: string;
  username: string;
  role: UserRole;
  status_akun: 'aktif' | 'nonaktif';
  created_at: string;
  avatar_url?: string;
  nisn_nip?: string;
  no_telepon?: string;
}

export interface ClassRoom {
  class_id: string;
  nama_kelas: string;
  mata_pelajaran: string;
  deskripsi: string;
  teacher_id: string;
  teacher_name?: string;
  kode_kelas: string;
  status: 'aktif' | 'arsip';
  created_at: string;
  cover_gradient?: string;
  tingkat?: string;
  tahun_ajaran?: string;
}

export interface ClassMember {
  membership_id: string;
  class_id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  tanggal_bergabung: string;
  status: 'aktif' | 'keluar';
}

export interface Material {
  material_id: string;
  class_id: string;
  teacher_id: string;
  judul: string;
  deskripsi: string;
  isi_materi: string;
  attachment_url?: string;
  video_url?: string;
  status: 'draf' | 'terbit' | 'arsip';
  published_at: string;
  created_at: string;
  file_name?: string;
  file_type?: string;
}

export type AnswerType = 'teks' | 'url' | 'file' | 'kombinasi';

export interface Assignment {
  assignment_id: string;
  class_id: string;
  teacher_id: string;
  judul: string;
  instruksi: string;
  jenis_jawaban: AnswerType;
  nilai_maksimum: number;
  tanggal_mulai: string;
  tenggat: string;
  status: 'draf' | 'dipublikasikan' | 'ditutup' | 'diarsipkan';
  created_at: string;
  attachment_url?: string;
}

export type SubmissionStatus = 
  | 'belum' 
  | 'draf' 
  | 'dikumpulkan' 
  | 'terlambat' 
  | 'sedang_dinilai' 
  | 'sudah_dinilai' 
  | 'perlu_revisi';

export interface Submission {
  submission_id: string;
  assignment_id: string;
  student_id: string;
  student_name?: string;
  jawaban_teks: string;
  jawaban_url?: string;
  attachment_url?: string;
  attachment_name?: string;
  submitted_at: string;
  status: SubmissionStatus;
  nilai?: number | null;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
}

export interface RubricCriterion {
  id: string;
  nama_kriteria: string;
  deskripsi: string;
  skor_min: number;
  skor_max: number;
  bobot_persen: number;
}

export interface PeerAssessment {
  assessment_id: string;
  class_id: string;
  teacher_id: string;
  judul: string;
  instruksi: string;
  rubrik_json: RubricCriterion[];
  tenggat: string;
  status: 'draf' | 'aktif' | 'selesai';
  created_at: string;
  is_anonymous: boolean;
}

export interface PeerAssessmentAssignment {
  peer_assignment_id: string;
  assessment_id: string;
  evaluator_id: string;
  evaluator_name?: string;
  evaluated_student_id: string;
  evaluated_student_name?: string;
  jawaban_rubrik_json?: Record<string, number>;
  komentar?: string;
  total_skor?: number;
  submitted_at?: string;
  status: 'belum' | 'draf' | 'dikumpulkan';
}

export type QuestionType = 'pilihan_ganda' | 'benar_salah' | 'isian_singkat' | 'uraian';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  pertanyaan: string;
  bobot: number;
  pilihan?: string[]; // for pilihan_ganda & benar_salah
  kunci_jawaban?: string | string[]; // hidden from students until authorized
  rubrik_uraian?: string;
}

export interface FormativeAssessment {
  formative_id: string;
  class_id: string;
  teacher_id: string;
  judul: string;
  instruksi: string;
  questions_json: QuizQuestion[];
  settings_json: {
    durasi_menit: number; // 0 for unlimited
    tampilkan_nilai_langsung: boolean;
    tampilkan_pembahasan: boolean;
    acak_soal: boolean;
  };
  tanggal_mulai: string;
  tenggat: string;
  status: 'draf' | 'aktif' | 'ditutup';
  created_at: string;
}

export interface FormativeResponse {
  response_id: string;
  formative_id: string;
  student_id: string;
  student_name?: string;
  answers_json: Record<string, string>; // questionId -> answer
  nilai_otomatis: number;
  nilai_manual?: number;
  total_nilai: number;
  feedback?: string;
  submitted_at: string;
  status: 'dinilai_otomatis' | 'menunggu_pemeriksaan' | 'selesai';
  graded_by?: string;
  graded_at?: string;
}

export interface ReflectionQuestion {
  id: string;
  type: 'skala_5' | 'teks' | 'pilihan';
  pertanyaan: string;
  pilihan?: string[];
}

export interface Reflection {
  reflection_id: string;
  class_id: string;
  material_id?: string;
  material_title?: string;
  student_id: string;
  student_name?: string;
  questions_json: ReflectionQuestion[];
  answers_json: Record<string, string | number>;
  submitted_at: string;
  status: 'dikirim';
  teacher_notes?: string;
  needs_attention?: boolean;
}

export type LeaveType = 'sakit' | 'keperluan_keluarga' | 'tugas_sekolah' | 'lainnya';
export type LeaveStatus = 'menunggu' | 'disetujui' | 'ditolak';

export interface LeaveRequest {
  leave_id: string;
  student_id: string;
  student_name?: string;
  class_id: string;
  class_name?: string;
  jenis_izin: LeaveType;
  tanggal_pengajuan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  attachment_url?: string;
  status: LeaveStatus;
  keputusan_guru_id?: string;
  keputusan_guru_name?: string;
  catatan_guru?: string;
  decided_at?: string;
  updated_at: string;
}

export interface NotificationItem {
  notification_id: string;
  user_id: string;
  judul: string;
  pesan: string;
  jenis: 'tugas' | 'materi' | 'izin' | 'nilai' | 'asesmen' | 'sistem';
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  log_id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  result: 'sukses' | 'gagal';
  details?: string;
}

export interface AppSettings {
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  spreadsheetId?: string;
  lastSyncedAt?: string;
  isConnected: boolean;
  isDemoMode: boolean;
}

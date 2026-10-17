import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  FullAppState,
  loadStoredState,
  saveStoredState,
  loadStoredConfig,
  saveStoredConfig,
  pushStateToGoogleSheets,
  pullStateFromGoogleSheets,
  testGasConnection
} from '../services/api';
import {
  User,
  ClassRoom,
  ClassMember,
  Material,
  Assignment,
  Submission,
  PeerAssessment,
  PeerAssessmentAssignment,
  FormativeAssessment,
  FormativeResponse,
  Reflection,
  LeaveRequest,
  NotificationItem,
  AuditLog,
  AppSettings,
  GoogleSheetsConfig
} from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  state: FullAppState;
  config: GoogleSheetsConfig;
  updateConfig: (cfg: Partial<GoogleSheetsConfig>) => void;
  syncToSheets: () => Promise<{ success: boolean; message: string }>;
  pullFromSheets: () => Promise<{ success: boolean; message: string }>;
  testConnection: (url: string) => Promise<{ success: boolean; message: string }>;
  resetToDefault: () => void;

  // Class Management
  createClass: (data: Omit<ClassRoom, 'class_id' | 'kode_kelas' | 'created_at' | 'status'>) => ClassRoom;
  joinClassByCode: (code: string) => { success: boolean; message: string; classRoom?: ClassRoom };
  archiveClass: (classId: string) => void;

  // Material Management
  createMaterial: (data: Omit<Material, 'material_id' | 'created_at'>) => Material;
  updateMaterial: (id: string, data: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  // Assignment Management
  createAssignment: (data: Omit<Assignment, 'assignment_id' | 'created_at'>) => Assignment;
  updateAssignment: (id: string, data: Partial<Assignment>) => void;
  submitAssignment: (data: {
    assignment_id: string;
    jawaban_teks: string;
    jawaban_url?: string;
    attachment_name?: string;
    attachment_url?: string;
    isDraft?: boolean;
  }) => Submission;
  gradeSubmission: (submissionId: string, nilai: number, feedback: string, needRevision?: boolean) => void;

  // Peer Assessment
  createPeerAssessment: (data: Omit<PeerAssessment, 'assessment_id' | 'created_at'>) => PeerAssessment;
  submitPeerEvaluation: (peerAssignmentId: string, answers: Record<string, number>, komentar: string) => void;

  // Formative Assessment
  createFormativeAssessment: (data: Omit<FormativeAssessment, 'formative_id' | 'created_at'>) => FormativeAssessment;
  submitFormativeResponse: (formativeId: string, answers: Record<string, string>) => FormativeResponse;
  gradeFormativeManual: (responseId: string, manualScore: number, feedback: string) => void;

  // Reflection
  submitReflection: (data: Omit<Reflection, 'reflection_id' | 'submitted_at' | 'status'>) => Reflection;
  updateReflectionTeacherNotes: (reflectionId: string, notes: string, needsAttention: boolean) => void;

  // Leave Requests
  submitLeaveRequest: (data: Omit<LeaveRequest, 'leave_id' | 'tanggal_pengajuan' | 'status' | 'updated_at'>) => LeaveRequest;
  reviewLeaveRequest: (leaveId: string, status: 'disetujui' | 'ditolak', notes: string) => void;

  // Notifications
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<FullAppState>(loadStoredState);
  const [config, setConfig] = useState<GoogleSheetsConfig>(loadStoredConfig);

  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  useEffect(() => {
    saveStoredConfig(config);
  }, [config]);

  const updateConfig = (newCfg: Partial<GoogleSheetsConfig>) => {
    setConfig(prev => ({ ...prev, ...newCfg }));
  };

  const addAuditLog = useCallback((action: string, entityType: string, entityId: string, details?: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      log_id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actor_id: currentUser.user_id,
      actor_name: currentUser.nama,
      action,
      entity_type: entityType,
      entity_id: entityId,
      timestamp: new Date().toISOString(),
      result: 'sukses',
      details
    };

    setState(prev => ({
      ...prev,
      AuditLogs: [newLog, ...prev.AuditLogs]
    }));
  }, [currentUser]);

  const createNotification = useCallback((userId: string, judul: string, pesan: string, jenis: NotificationItem['jenis'], relatedId?: string) => {
    const newNotif: NotificationItem = {
      notification_id: `NOTIF_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      judul,
      pesan,
      jenis,
      related_id: relatedId,
      is_read: false,
      created_at: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      Notifications: [newNotif, ...prev.Notifications]
    }));
  }, []);

  const syncToSheets = async () => {
    if (!config.webAppUrl) {
      return { success: false, message: 'Harap masukkan URL Google Apps Script Web App di Pengaturan terlebih dahulu.' };
    }
    const result = await pushStateToGoogleSheets(config.webAppUrl, state);
    if (result.success) {
      updateConfig({ lastSyncedAt: new Date().toISOString(), isConnected: true, isDemoMode: false });
    }
    return result;
  };

  const pullFromSheets = async () => {
    if (!config.webAppUrl) {
      return { success: false, message: 'Harap masukkan URL Google Apps Script Web App di Pengaturan terlebih dahulu.' };
    }
    const result = await pullStateFromGoogleSheets(config.webAppUrl);
    if (result.success && result.state) {
      setState(result.state);
      updateConfig({ lastSyncedAt: new Date().toISOString(), isConnected: true, isDemoMode: false });
    }
    return result;
  };

  const testConnection = async (url: string) => {
    const res = await testGasConnection(url);
    if (res.success) {
      updateConfig({ webAppUrl: url, isConnected: true, isDemoMode: false });
    }
    return res;
  };

  const resetToDefault = () => {
    localStorage.removeItem('kd_full_state_v1');
    const fresh = loadStoredState();
    setState(fresh);
  };

  // ---------------- CLASS OPERATIONS ---------------- //
  const createClass = (data: Omit<ClassRoom, 'class_id' | 'kode_kelas' | 'created_at' | 'status'>): ClassRoom => {
    // Generate unique 6 uppercase letters/digits
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newClass: ClassRoom = {
      ...data,
      class_id: `CLS_${Date.now().toString(36).toUpperCase()}`,
      kode_kelas: code,
      status: 'aktif',
      created_at: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      Classes: [newClass, ...prev.Classes]
    }));

    addAuditLog('CREATE_CLASS', 'ClassRoom', newClass.class_id, `Membuat kelas ${newClass.nama_kelas} (Kode: ${code})`);
    return newClass;
  };

  const joinClassByCode = (code: string) => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };
    const cleanCode = code.trim().toUpperCase();
    const targetClass = state.Classes.find(c => c.kode_kelas.toUpperCase() === cleanCode && c.status === 'aktif');

    if (!targetClass) {
      return { success: false, message: 'Kode kelas tidak ditemukan atau kelas telah diarsipkan.' };
    }

    const alreadyJoined = state.ClassMembers.some(
      m => m.class_id === targetClass.class_id && m.student_id === currentUser.user_id && m.status === 'aktif'
    );

    if (alreadyJoined) {
      return { success: false, message: 'Kamu sudah terdaftar di kelas ini!' };
    }

    const newMember: ClassMember = {
      membership_id: `MBR_${Date.now().toString(36).toUpperCase()}`,
      class_id: targetClass.class_id,
      student_id: currentUser.user_id,
      student_name: currentUser.nama,
      student_email: currentUser.email,
      tanggal_bergabung: new Date().toISOString(),
      status: 'aktif'
    };

    setState(prev => ({
      ...prev,
      ClassMembers: [...prev.ClassMembers, newMember]
    }));

    addAuditLog('JOIN_CLASS', 'ClassMember', newMember.membership_id, `Bergabung ke kelas ${targetClass.nama_kelas}`);
    createNotification(
      targetClass.teacher_id,
      'Siswa Baru Bergabung',
      `${currentUser.nama} telah bergabung ke kelas ${targetClass.nama_kelas}.`,
      'sistem',
      targetClass.class_id
    );

    return { success: true, message: `Berhasil bergabung ke ${targetClass.nama_kelas}!`, classRoom: targetClass };
  };

  const archiveClass = (classId: string) => {
    setState(prev => ({
      ...prev,
      Classes: prev.Classes.map(c => c.class_id === classId ? { ...c, status: 'arsip' } : c)
    }));
    addAuditLog('ARCHIVE_CLASS', 'ClassRoom', classId, 'Mengarsipkan kelas');
  };

  // ---------------- MATERIAL OPERATIONS ---------------- //
  const createMaterial = (data: Omit<Material, 'material_id' | 'created_at'>): Material => {
    const newMaterial: Material = {
      ...data,
      material_id: `MAT_${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      Materials: [newMaterial, ...prev.Materials]
    }));

    addAuditLog('CREATE_MATERIAL', 'Material', newMaterial.material_id, `Menambahkan materi ${newMaterial.judul}`);

    // Notify enrolled students
    const enrolledStudents = state.ClassMembers.filter(m => m.class_id === newMaterial.class_id && m.status === 'aktif');
    enrolledStudents.forEach(st => {
      createNotification(st.student_id, 'Materi Baru Tersedia', `Guru mempublikasikan materi baru: "${newMaterial.judul}".`, 'materi', newMaterial.material_id);
    });

    return newMaterial;
  };

  const updateMaterial = (id: string, data: Partial<Material>) => {
    setState(prev => ({
      ...prev,
      Materials: prev.Materials.map(m => m.material_id === id ? { ...m, ...data } : m)
    }));
    addAuditLog('UPDATE_MATERIAL', 'Material', id, 'Memperbarui materi pembelajaran');
  };

  const deleteMaterial = (id: string) => {
    setState(prev => ({
      ...prev,
      Materials: prev.Materials.filter(m => m.material_id !== id)
    }));
    addAuditLog('DELETE_MATERIAL', 'Material', id, 'Menghapus materi pembelajaran');
  };

  // ---------------- ASSIGNMENT & SUBMISSION OPERATIONS ---------------- //
  const createAssignment = (data: Omit<Assignment, 'assignment_id' | 'created_at'>): Assignment => {
    const newAssignment: Assignment = {
      ...data,
      assignment_id: `ASN_${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      Assignments: [newAssignment, ...prev.Assignments]
    }));

    addAuditLog('CREATE_ASSIGNMENT', 'Assignment', newAssignment.assignment_id, `Membuat tugas "${newAssignment.judul}"`);

    // Notify class students
    const enrolledStudents = state.ClassMembers.filter(m => m.class_id === newAssignment.class_id && m.status === 'aktif');
    enrolledStudents.forEach(st => {
      createNotification(st.student_id, 'Tugas Baru Diterbitkan', `Tugas "${newAssignment.judul}" telah dibuka. Tenggat: ${new Date(newAssignment.tenggat).toLocaleDateString('id-ID')}.`, 'tugas', newAssignment.assignment_id);
    });

    return newAssignment;
  };

  const updateAssignment = (id: string, data: Partial<Assignment>) => {
    setState(prev => ({
      ...prev,
      Assignments: prev.Assignments.map(a => a.assignment_id === id ? { ...a, ...data } : a)
    }));
    addAuditLog('UPDATE_ASSIGNMENT', 'Assignment', id, 'Memperbarui tugas pembelajaran');
  };

  const submitAssignment = (data: {
    assignment_id: string;
    jawaban_teks: string;
    jawaban_url?: string;
    attachment_name?: string;
    attachment_url?: string;
    isDraft?: boolean;
  }): Submission => {
    if (!currentUser) throw new Error('Harap login untuk mengumpulkan tugas.');
    const assignment = state.Assignments.find(a => a.assignment_id === data.assignment_id);
    if (!assignment) throw new Error('Tugas tidak ditemukan.');

    const isLate = new Date() > new Date(assignment.tenggat);
    const existingSubmission = state.Submissions.find(
      s => s.assignment_id === data.assignment_id && s.student_id === currentUser.user_id
    );

    const submissionStatus = data.isDraft ? 'draf' : isLate ? 'terlambat' : 'dikumpulkan';

    let updatedSubmission: Submission;

    if (existingSubmission) {
      updatedSubmission = {
        ...existingSubmission,
        jawaban_teks: data.jawaban_teks,
        jawaban_url: data.jawaban_url || existingSubmission.jawaban_url,
        attachment_name: data.attachment_name || existingSubmission.attachment_name,
        attachment_url: data.attachment_url || existingSubmission.attachment_url,
        submitted_at: new Date().toISOString(),
        status: submissionStatus
      };

      setState(prev => ({
        ...prev,
        Submissions: prev.Submissions.map(s => s.submission_id === existingSubmission.submission_id ? updatedSubmission : s)
      }));
    } else {
      updatedSubmission = {
        submission_id: `SUB_${Date.now().toString(36).toUpperCase()}`,
        assignment_id: data.assignment_id,
        student_id: currentUser.user_id,
        student_name: currentUser.nama,
        jawaban_teks: data.jawaban_teks,
        jawaban_url: data.jawaban_url,
        attachment_name: data.attachment_name,
        attachment_url: data.attachment_url,
        submitted_at: new Date().toISOString(),
        status: submissionStatus,
        nilai: null
      };

      setState(prev => ({
        ...prev,
        Submissions: [updatedSubmission, ...prev.Submissions]
      }));
    }

    addAuditLog('SUBMIT_ASSIGNMENT', 'Submission', updatedSubmission.submission_id, `Mengumpulkan tugas ${assignment.judul}`);

    if (!data.isDraft) {
      createNotification(
        assignment.teacher_id,
        'Pengumpulan Tugas Masuk',
        `${currentUser.nama} telah mengumpulkan tugas "${assignment.judul}".`,
        'tugas',
        data.assignment_id
      );
    }

    return updatedSubmission;
  };

  const gradeSubmission = (submissionId: string, nilai: number, feedback: string, needRevision = false) => {
    if (!currentUser) return;
    const submission = state.Submissions.find(s => s.submission_id === submissionId);
    if (!submission) return;

    const assignment = state.Assignments.find(a => a.assignment_id === submission.assignment_id);

    const newStatus = needRevision ? 'perlu_revisi' : 'sudah_dinilai';

    setState(prev => ({
      ...prev,
      Submissions: prev.Submissions.map(s => s.submission_id === submissionId ? {
        ...s,
        nilai,
        feedback,
        status: newStatus,
        graded_by: currentUser.user_id,
        graded_at: new Date().toISOString()
      } : s)
    }));

    addAuditLog('GRADE_SUBMISSION', 'Submission', submissionId, `Memberi nilai ${nilai} untuk murid ${submission.student_name}`);

    createNotification(
      submission.student_id,
      needRevision ? 'Tugas Memerlukan Revisi' : 'Tugas Telah Dinilai',
      `Tugas "${assignment?.judul || 'Tugas'}" mendapatkan nilai ${nilai}. Umpan balik guru: ${feedback || 'Baik.'}`,
      'nilai',
      submission.assignment_id
    );
  };

  // ---------------- PEER ASSESSMENT OPERATIONS ---------------- //
  const createPeerAssessment = (data: Omit<PeerAssessment, 'assessment_id' | 'created_at'>): PeerAssessment => {
    const newPeer: PeerAssessment = {
      ...data,
      assessment_id: `PEER_${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString()
    };

    // Auto-distribute peer evaluations among enrolled students
    // Rule: Cannot evaluate self! Rotates array: student[i] evaluates student[(i+1)%len]
    const members = state.ClassMembers.filter(m => m.class_id === data.class_id && m.status === 'aktif');
    const newPeerAssignments: PeerAssessmentAssignment[] = [];

    if (members.length >= 2) {
      for (let i = 0; i < members.length; i++) {
        const evaluator = members[i];
        const evaluated = members[(i + 1) % members.length]; // circular shift

        newPeerAssignments.push({
          peer_assignment_id: `PASG_${Date.now().toString(36)}_${i}`,
          assessment_id: newPeer.assessment_id,
          evaluator_id: evaluator.student_id,
          evaluator_name: evaluator.student_name,
          evaluated_student_id: evaluated.student_id,
          evaluated_student_name: evaluated.student_name,
          status: 'belum'
        });
      }
    }

    setState(prev => ({
      ...prev,
      PeerAssessments: [newPeer, ...prev.PeerAssessments],
      PeerAssessmentAssignments: [...newPeerAssignments, ...prev.PeerAssessmentAssignments]
    }));

    addAuditLog('CREATE_PEER_ASSESSMENT', 'PeerAssessment', newPeer.assessment_id, `Membuat asesmen praktik antarteman: ${newPeer.judul}`);

    members.forEach(m => {
      createNotification(m.student_id, 'Asesmen Praktik Antarteman Baru', `Kamu ditugaskan menilai unjuk kerja teman di kelas. Cek menu Asesmen Praktik.`, 'asesmen', newPeer.assessment_id);
    });

    return newPeer;
  };

  const submitPeerEvaluation = (peerAssignmentId: string, answers: Record<string, number>, komentar: string) => {
    const pa = state.PeerAssessmentAssignments.find(p => p.peer_assignment_id === peerAssignmentId);
    if (!pa) return;

    // Calculate total score based on rubric
    const assessment = state.PeerAssessments.find(a => a.assessment_id === pa.assessment_id);
    let totalScore = 0;
    if (assessment && assessment.rubrik_json.length > 0) {
      let weightedSum = 0;
      let totalWeight = 0;
      assessment.rubrik_json.forEach(crit => {
        const score = answers[crit.id] || 0;
        const norm = (score / crit.skor_max) * 100;
        weightedSum += norm * (crit.bobot_persen || 25);
        totalWeight += (crit.bobot_persen || 25);
      });
      totalScore = Math.round(totalWeight > 0 ? weightedSum / totalWeight : 0);
    } else {
      totalScore = 80;
    }

    setState(prev => ({
      ...prev,
      PeerAssessmentAssignments: prev.PeerAssessmentAssignments.map(item => item.peer_assignment_id === peerAssignmentId ? {
        ...item,
        jawaban_rubrik_json: answers,
        komentar,
        total_skor: totalScore,
        submitted_at: new Date().toISOString(),
        status: 'dikumpulkan'
      } : item)
    }));

    addAuditLog('SUBMIT_PEER_EVALUATION', 'PeerAssessmentAssignment', peerAssignmentId, `Menyelesaikan penilaian unjuk kerja rekan`);
  };

  // ---------------- FORMATIVE ASSESSMENT OPERATIONS ---------------- //
  const createFormativeAssessment = (data: Omit<FormativeAssessment, 'formative_id' | 'created_at'>): FormativeAssessment => {
    const newFormative: FormativeAssessment = {
      ...data,
      formative_id: `FMT_${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      FormativeAssessments: [newFormative, ...prev.FormativeAssessments]
    }));

    addAuditLog('CREATE_FORMATIVE', 'FormativeAssessment', newFormative.formative_id, `Membuat kuis formatif ${newFormative.judul}`);

    const members = state.ClassMembers.filter(m => m.class_id === data.class_id && m.status === 'aktif');
    members.forEach(m => {
      createNotification(m.student_id, 'Kuis Formatif Baru', `Kuis "${newFormative.judul}" telah dibuka. Kerjakan sebelum tenggat.`, 'asesmen', newFormative.formative_id);
    });

    return newFormative;
  };

  const submitFormativeResponse = (formativeId: string, answers: Record<string, string>): FormativeResponse => {
    if (!currentUser) throw new Error('Harap login terlebih dahulu');
    const formative = state.FormativeAssessments.find(f => f.formative_id === formativeId);
    if (!formative) throw new Error('Kuis tidak ditemukan');

    // Auto calculate score for objective questions
    let autoScore = 0;
    let hasEssay = false;

    formative.questions_json.forEach(q => {
      if (q.type === 'uraian') {
        hasEssay = true;
      } else {
        const studentAns = (answers[q.id] || '').trim().toLowerCase();
        const key = Array.isArray(q.kunci_jawaban) 
          ? q.kunci_jawaban.map(k => k.trim().toLowerCase()) 
          : [String(q.kunci_jawaban || '').trim().toLowerCase()];

        if (key.includes(studentAns)) {
          autoScore += q.bobot;
        }
      }
    });

    const newResponse: FormativeResponse = {
      response_id: `RESP_${Date.now().toString(36).toUpperCase()}`,
      formative_id: formativeId,
      student_id: currentUser.user_id,
      student_name: currentUser.nama,
      answers_json: answers,
      nilai_otomatis: autoScore,
      nilai_manual: 0,
      total_nilai: autoScore,
      status: hasEssay ? 'menunggu_pemeriksaan' : 'selesai',
      submitted_at: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      FormativeResponses: [newResponse, ...prev.FormativeResponses.filter(r => !(r.formative_id === formativeId && r.student_id === currentUser.user_id))]
    }));

    addAuditLog('SUBMIT_FORMATIVE', 'FormativeResponse', newResponse.response_id, `Mengerjakan asesmen formatif: ${formative.judul}`);

    if (hasEssay) {
      createNotification(
        formative.teacher_id,
        'Jawaban Kuis Memerlukan Pemeriksaan',
        `${currentUser.nama} telah menyelesaikan kuis "${formative.judul}". Terdapat soal uraian yang perlu dinilai manual.`,
        'asesmen',
        formativeId
      );
    }

    return newResponse;
  };

  const gradeFormativeManual = (responseId: string, manualScore: number, feedback: string) => {
    if (!currentUser) return;
    const response = state.FormativeResponses.find(r => r.response_id === responseId);
    if (!response) return;

    const total = response.nilai_otomatis + manualScore;

    setState(prev => ({
      ...prev,
      FormativeResponses: prev.FormativeResponses.map(r => r.response_id === responseId ? {
        ...r,
        nilai_manual: manualScore,
        total_nilai: total,
        feedback,
        status: 'selesai',
        graded_by: currentUser.user_id,
        graded_at: new Date().toISOString()
      } : r)
    }));

    addAuditLog('GRADE_FORMATIVE_MANUAL', 'FormativeResponse', responseId, `Menilai uraian kuis untuk ${response.student_name}`);

    createNotification(
      response.student_id,
      'Hasil Kuis Formatif Telah Dinilai',
      `Guru telah selesai memeriksa jawaban uraian kuis. Total nilai kamu: ${total}.`,
      'nilai',
      response.formative_id
    );
  };

  // ---------------- REFLECTION OPERATIONS ---------------- //
  const submitReflection = (data: Omit<Reflection, 'reflection_id' | 'submitted_at' | 'status'>): Reflection => {
    const newReflection: Reflection = {
      ...data,
      reflection_id: `REFL_${Date.now().toString(36).toUpperCase()}`,
      submitted_at: new Date().toISOString(),
      status: 'dikirim'
    };

    setState(prev => ({
      ...prev,
      Reflections: [newReflection, ...prev.Reflections]
    }));

    addAuditLog('SUBMIT_REFLECTION', 'Reflection', newReflection.reflection_id, 'Mengisi refleksi pembelajaran');
    return newReflection;
  };

  const updateReflectionTeacherNotes = (reflectionId: string, notes: string, needsAttention: boolean) => {
    setState(prev => ({
      ...prev,
      Reflections: prev.Reflections.map(r => r.reflection_id === reflectionId ? {
        ...r,
        teacher_notes: notes,
        needs_attention: needsAttention
      } : r)
    }));
    addAuditLog('UPDATE_REFLECTION_NOTE', 'Reflection', reflectionId, `Memperbarui catatan refleksi (Perlu Bantuan: ${needsAttention})`);
  };

  // ---------------- LEAVE REQUEST OPERATIONS ---------------- //
  const submitLeaveRequest = (data: Omit<LeaveRequest, 'leave_id' | 'tanggal_pengajuan' | 'status' | 'updated_at'>): LeaveRequest => {
    const newLeave: LeaveRequest = {
      ...data,
      leave_id: `LV_${Date.now().toString(36).toUpperCase()}`,
      tanggal_pengajuan: new Date().toISOString(),
      status: 'menunggu',
      updated_at: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      LeaveRequests: [newLeave, ...prev.LeaveRequests]
    }));

    addAuditLog('SUBMIT_LEAVE', 'LeaveRequest', newLeave.leave_id, `Mengajukan surat izin (${newLeave.jenis_izin})`);

    // Notify teacher of the class
    const targetClass = state.Classes.find(c => c.class_id === data.class_id);
    if (targetClass) {
      createNotification(
        targetClass.teacher_id,
        'Pengajuan Surat Izin Baru',
        `${data.student_name || 'Siswa'} mengajukan izin (${data.jenis_izin.replace('_', ' ')}) tanggal ${data.tanggal_mulai} s.d ${data.tanggal_selesai}.`,
        'izin',
        newLeave.leave_id
      );
    }

    return newLeave;
  };

  const reviewLeaveRequest = (leaveId: string, status: 'disetujui' | 'ditolak', notes: string) => {
    if (!currentUser) return;
    const leave = state.LeaveRequests.find(l => l.leave_id === leaveId);
    if (!leave) return;

    setState(prev => ({
      ...prev,
      LeaveRequests: prev.LeaveRequests.map(l => l.leave_id === leaveId ? {
        ...l,
        status,
        catatan_guru: notes,
        keputusan_guru_id: currentUser.user_id,
        keputusan_guru_name: currentUser.nama,
        decided_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : l)
    }));

    addAuditLog('REVIEW_LEAVE', 'LeaveRequest', leaveId, `Memproses izin siswa (${status.toUpperCase()})`);

    createNotification(
      leave.student_id,
      `Surat Izin ${status === 'disetujui' ? 'Disetujui' : 'Ditolak'}`,
      `Permohonan izin kamu telah ${status} oleh ${currentUser.nama}. Catatan: ${notes || '-'}`,
      'izin',
      leaveId
    );
  };

  // ---------------- NOTIFICATIONS ---------------- //
  const markNotificationAsRead = (notificationId: string) => {
    setState(prev => ({
      ...prev,
      Notifications: prev.Notifications.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n)
    }));
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setState(prev => ({
      ...prev,
      Notifications: prev.Notifications.map(n => n.user_id === currentUser.user_id ? { ...n, is_read: true } : n)
    }));
  };

  return (
    <DataContext.Provider
      value={{
        state,
        config,
        updateConfig,
        syncToSheets,
        pullFromSheets,
        testConnection,
        resetToDefault,
        createClass,
        joinClassByCode,
        archiveClass,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        createAssignment,
        updateAssignment,
        submitAssignment,
        gradeSubmission,
        createPeerAssessment,
        submitPeerEvaluation,
        createFormativeAssessment,
        submitFormativeResponse,
        gradeFormativeManual,
        submitReflection,
        updateReflectionTeacherNotes,
        submitLeaveRequest,
        reviewLeaveRequest,
        markNotificationAsRead,
        markAllNotificationsAsRead
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

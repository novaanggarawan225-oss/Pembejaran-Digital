import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Youtube, 
  Paperclip, 
  Clock, 
  BookOpen, 
  X, 
  Edit3, 
  Trash2, 
  CheckCircle2,
  Calendar,
  Eye
} from 'lucide-react';
import { Material } from '../types';

export const MaterialsView: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { state, createMaterial, updateMaterial, deleteMaterial } = useData();

  const isTeacher = role === 'GURU';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'terbit' | 'draf'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMaterialModal, setActiveMaterialModal] = useState<Material | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formClassId, setFormClassId] = useState('');
  const [formJudul, setFormJudul] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formIsi, setFormIsi] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [formStatus, setFormStatus] = useState<'terbit' | 'draf'>('terbit');

  // Accessible classes for current user
  const userClasses = state.Classes.filter(c => {
    if (isTeacher) return c.teacher_id === currentUser?.user_id;
    return state.ClassMembers.some(m => m.class_id === c.class_id && m.student_id === currentUser?.user_id && m.status === 'aktif');
  });
  const userClassIds = userClasses.map(c => c.class_id);

  // Filter materials
  const filteredMaterials = state.Materials.filter(m => {
    // Role check: Murid only sees materials of classes they are enrolled in, and only 'terbit'
    if (!userClassIds.includes(m.class_id)) return false;
    if (!isTeacher && m.status !== 'terbit') return false;

    // Filter by class dropdown
    if (selectedClassFilter !== 'all' && m.class_id !== selectedClassFilter) return false;

    // Filter by status (Guru only)
    if (isTeacher && statusFilter !== 'all' && m.status !== statusFilter) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.judul.toLowerCase().includes(q);
      const matchDesc = m.deskripsi.toLowerCase().includes(q);
      const matchContent = m.isi_materi.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchContent;
    }

    return true;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormClassId(userClasses[0]?.class_id || '');
    setFormJudul('');
    setFormDeskripsi('');
    setFormIsi('');
    setFormVideoUrl('');
    setFormAttachmentUrl('');
    setFormFileName('');
    setFormStatus('terbit');
    setShowCreateModal(true);
  };

  const handleOpenEdit = (m: Material) => {
    setEditingId(m.material_id);
    setFormClassId(m.class_id);
    setFormJudul(m.judul);
    setFormDeskripsi(m.deskripsi);
    setFormIsi(m.isi_materi);
    setFormVideoUrl(m.video_url || '');
    setFormAttachmentUrl(m.attachment_url || '');
    setFormFileName(m.file_name || '');
    setFormStatus(m.status === 'draf' ? 'draf' : 'terbit');
    setShowCreateModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formClassId) return;

    if (editingId) {
      updateMaterial(editingId, {
        class_id: formClassId,
        judul: formJudul.trim(),
        deskripsi: formDeskripsi.trim(),
        isi_materi: formIsi.trim(),
        video_url: formVideoUrl.trim() || undefined,
        attachment_url: formAttachmentUrl.trim() || undefined,
        file_name: formFileName.trim() || undefined,
        status: formStatus,
        published_at: formStatus === 'terbit' ? new Date().toISOString() : ''
      });
    } else {
      createMaterial({
        class_id: formClassId,
        teacher_id: currentUser?.user_id || '',
        judul: formJudul.trim(),
        deskripsi: formDeskripsi.trim(),
        isi_materi: formIsi.trim(),
        video_url: formVideoUrl.trim() || undefined,
        attachment_url: formAttachmentUrl.trim() || undefined,
        file_name: formFileName.trim() || undefined,
        file_type: formAttachmentUrl ? 'Dokumen Lampiran' : undefined,
        status: formStatus,
        published_at: formStatus === 'terbit' ? new Date().toISOString() : ''
      });
    }

    setShowCreateModal(false);
  };

  // Helper to extract YouTube embed ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Materi Pembelajaran</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTeacher 
              ? 'Terbitkan modul ajar, video referensi, dan dokumen lampiran untuk kelas Anda.'
              : 'Akses modul, bahan bacaan, video, dan berkas belajar dari bapak/ibu guru.'}
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Materi Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi berdasarkan judul atau isi..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Class Filter */}
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

          {/* Status Filter for Guru */}
          {isTeacher && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Semua Status</option>
                <option value="terbit">Dipublikasikan</option>
                <option value="draf">Draf</option>
              </select>
            </div>
          )}

          <span className="text-slate-400 tabular-nums ml-auto md:ml-2">
            {filteredMaterials.length} materi
          </span>
        </div>
      </div>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
          <h3 className="text-sm font-bold text-slate-700">Belum ada materi pembelajaran</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isTeacher 
              ? 'Tambahkan materi baru dengan mengklik tombol Tambah Materi di atas.'
              : 'Guru belum mengunggah materi untuk filter yang dipilih.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map(mat => {
            const cls = state.Classes.find(c => c.class_id === mat.class_id);
            const ytId = mat.video_url ? getYouTubeId(mat.video_url) : null;

            return (
              <div
                key={mat.material_id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  {/* Category and Status kicker */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-blue-700 truncate max-w-[170px]">
                      {cls?.nama_kelas || 'Kelas'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isTeacher && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          mat.status === 'terbit' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {mat.status}
                        </span>
                      )}
                      <span className="text-[11px] tabular-nums">
                        {new Date(mat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                      {mat.judul}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {mat.deskripsi}
                    </p>
                  </div>

                  {/* Attachment pills/preview */}
                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    {mat.video_url && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-medium text-[11px]">
                        <Youtube className="w-3.5 h-3.5" />
                        <span>Video Pembelajaran</span>
                      </span>
                    )}
                    {mat.attachment_url && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px]">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{mat.file_name || 'Lampiran Berkas'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer action */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <button
                    onClick={() => setActiveMaterialModal(mat)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Baca Materi</span>
                  </button>

                  {isTeacher && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(mat)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit Materi"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMaterial(mat.material_id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: View Full Material */}
      {activeMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <div className="overflow-hidden">
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                  {state.Classes.find(c => c.class_id === activeMaterialModal.class_id)?.nama_kelas}
                </span>
                <h2 className="text-base font-bold text-slate-900 truncate">
                  {activeMaterialModal.judul}
                </h2>
              </div>
              <button
                onClick={() => setActiveMaterialModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs leading-relaxed">
              {/* YouTube Player if present */}
              {activeMaterialModal.video_url && getYouTubeId(activeMaterialModal.video_url) && (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xs">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeId(activeMaterialModal.video_url)}`}
                    title="Video Pembelajaran"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Description callout */}
              {activeMaterialModal.deskripsi && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700">
                  {activeMaterialModal.deskripsi}
                </div>
              )}

              {/* Content Body */}
              <div className="prose prose-slate max-w-none text-xs whitespace-pre-line leading-relaxed">
                {activeMaterialModal.isi_materi}
              </div>

              {/* Attachments Section */}
              {activeMaterialModal.attachment_url && (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <span>Lampiran Dokumen &amp; Sumber Belajar</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100">
                    <span className="font-medium text-slate-800 truncate">
                      {activeMaterialModal.file_name || 'Dokumen Google Drive'}
                    </span>
                    <a
                      href={activeMaterialModal.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-semibold flex items-center gap-1 shrink-0 ml-3 transition-colors"
                    >
                      <span>Buka Tautan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
              <span>
                Dipublikasikan: {new Date(activeMaterialModal.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </span>
              <button
                onClick={() => setActiveMaterialModal(null)}
                className="px-4 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Material (Guru) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? 'Edit Materi Pembelajaran' : 'Tambah Materi Pembelajaran Baru'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
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
                        {c.nama_kelas} ({c.mata_pelajaran})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Publikasi</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="terbit">Langsung Terbitkan (Dapat diakses murid)</option>
                    <option value="draf">Simpan Sebagai Draf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Materi *</label>
                <input
                  type="text"
                  required
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Pewarisan Sifat & Hukum Mendel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ringkasan / Deskripsi Singkat</label>
                <input
                  type="text"
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Ringkasan poin penting materi untuk tampilan kartu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi / Uraian Materi Lengkap *</label>
                <textarea
                  required
                  rows={6}
                  value={formIsi}
                  onChange={(e) => setFormIsi(e.target.value)}
                  placeholder="Tuliskan materi pembelajaran, poin-poin penjelasan, rumus, atau instruksi bacaan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tautan Video YouTube (Opsional)</label>
                  <input
                    type="url"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tautan File Google Drive/PDF (Opsional)</label>
                  <input
                    type="url"
                    value={formAttachmentUrl}
                    onChange={(e) => setFormAttachmentUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {formAttachmentUrl && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Tampilan Berkas</label>
                  <input
                    type="text"
                    value={formFileName}
                    onChange={(e) => setFormFileName(e.target.value)}
                    placeholder="Contoh: Modul_IPA_Bab3.pdf"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

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
                  {editingId ? 'Simpan Perubahan' : 'Terbitkan Materi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

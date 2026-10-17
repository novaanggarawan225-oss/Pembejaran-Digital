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
  AppSettings
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    user_id: 'USR_GURU_01',
    nama: 'Budi Santoso, S.Pd., M.Pd.',
    email: 'budi.santoso@guru.smp.belajar.id',
    username: 'pakbudi',
    role: 'GURU',
    status_akun: 'aktif',
    created_at: '2026-01-05T08:00:00Z',
    nisn_nip: '198405122008011004',
    no_telepon: '081234567890'
  },
  {
    user_id: 'USR_GURU_02',
    nama: 'Siti Rahmawati, M.Si.',
    email: 'siti.rahmawati@guru.smp.belajar.id',
    username: 'busiti',
    role: 'GURU',
    status_akun: 'aktif',
    created_at: '2026-01-05T08:30:00Z',
    nisn_nip: '198907212015022001',
    no_telepon: '081298765432'
  },
  {
    user_id: 'USR_MURID_01',
    nama: 'Ahmad Fauzan',
    email: 'ahmad.fauzan@siswa.smp.belajar.id',
    username: 'ahmadfauzan',
    role: 'MURID',
    status_akun: 'aktif',
    created_at: '2026-01-10T09:00:00Z',
    nisn_nip: '0098765431',
    no_telepon: '085711223344'
  },
  {
    user_id: 'USR_MURID_02',
    nama: 'Nabila Putri Azzahra',
    email: 'nabila.putri@siswa.smp.belajar.id',
    username: 'nabilaputri',
    role: 'MURID',
    status_akun: 'aktif',
    created_at: '2026-01-10T09:10:00Z',
    nisn_nip: '0098765432',
    no_telepon: '085722334455'
  },
  {
    user_id: 'USR_MURID_03',
    nama: 'Rizky Pratama',
    email: 'rizky.pratama@siswa.smp.belajar.id',
    username: 'rizkypratama',
    role: 'MURID',
    status_akun: 'aktif',
    created_at: '2026-01-10T09:20:00Z',
    nisn_nip: '0098765433',
    no_telepon: '085733445566'
  },
  {
    user_id: 'USR_MURID_04',
    nama: 'Dewi Lestari',
    email: 'dewi.lestari@siswa.smp.belajar.id',
    username: 'dewilestari',
    role: 'MURID',
    status_akun: 'aktif',
    created_at: '2026-01-10T09:30:00Z',
    nisn_nip: '0098765434',
    no_telepon: '085744556677'
  }
];

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    class_id: 'CLS_IPA_9A',
    nama_kelas: 'Ilmu Pengetahuan Alam IX-A',
    mata_pelajaran: 'IPA Terpadu',
    deskripsi: 'Kelas pembelajaran IPA Terpadu Kelas IX-A Semester Genap TA 2025/2026. Fokus pada Bioteknologi & Kelistrikan.',
    teacher_id: 'USR_GURU_01',
    teacher_name: 'Budi Santoso, S.Pd., M.Pd.',
    kode_kelas: 'IPA9A1',
    status: 'aktif',
    created_at: '2026-01-08T07:30:00Z',
    cover_gradient: 'from-blue-700 to-indigo-900',
    tingkat: 'Kelas IX',
    tahun_ajaran: '2025/2026 Genap'
  },
  {
    class_id: 'CLS_MTK_9A',
    nama_kelas: 'Matematika IX-A',
    mata_pelajaran: 'Matematika',
    deskripsi: 'Transformasi Geometri, Bangun Ruang Sisi Lengkung, dan Statistik Terapan.',
    teacher_id: 'USR_GURU_02',
    teacher_name: 'Siti Rahmawati, M.Si.',
    kode_kelas: 'MTK9A2',
    status: 'aktif',
    created_at: '2026-01-08T08:00:00Z',
    cover_gradient: 'from-teal-700 to-emerald-900',
    tingkat: 'Kelas IX',
    tahun_ajaran: '2025/2026 Genap'
  },
  {
    class_id: 'CLS_TIK_9A',
    nama_kelas: 'Informatika & Literasi Digital IX',
    mata_pelajaran: 'Informatika',
    deskripsi: 'Berpikir Komputasional, Algoritma Pemrograman Sederhana, dan Etika Digital.',
    teacher_id: 'USR_GURU_01',
    teacher_name: 'Budi Santoso, S.Pd., M.Pd.',
    kode_kelas: 'TIK9A3',
    status: 'aktif',
    created_at: '2026-01-09T10:00:00Z',
    cover_gradient: 'from-amber-600 to-orange-800',
    tingkat: 'Kelas IX',
    tahun_ajaran: '2025/2026 Genap'
  }
];

export const INITIAL_MEMBERS: ClassMember[] = [
  {
    membership_id: 'MBR_01',
    class_id: 'CLS_IPA_9A',
    student_id: 'USR_MURID_01',
    student_name: 'Ahmad Fauzan',
    student_email: 'ahmad.fauzan@siswa.smp.belajar.id',
    tanggal_bergabung: '2026-01-10T10:00:00Z',
    status: 'aktif'
  },
  {
    membership_id: 'MBR_02',
    class_id: 'CLS_IPA_9A',
    student_id: 'USR_MURID_02',
    student_name: 'Nabila Putri Azzahra',
    student_email: 'nabila.putri@siswa.smp.belajar.id',
    tanggal_bergabung: '2026-01-10T10:05:00Z',
    status: 'aktif'
  },
  {
    membership_id: 'MBR_03',
    class_id: 'CLS_IPA_9A',
    student_id: 'USR_MURID_03',
    student_name: 'Rizky Pratama',
    student_email: 'rizky.pratama@siswa.smp.belajar.id',
    tanggal_bergabung: '2026-01-10T10:10:00Z',
    status: 'aktif'
  },
  {
    membership_id: 'MBR_04',
    class_id: 'CLS_IPA_9A',
    student_id: 'USR_MURID_04',
    student_name: 'Dewi Lestari',
    student_email: 'dewi.lestari@siswa.smp.belajar.id',
    tanggal_bergabung: '2026-01-10T10:15:00Z',
    status: 'aktif'
  },
  {
    membership_id: 'MBR_05',
    class_id: 'CLS_MTK_9A',
    student_id: 'USR_MURID_01',
    student_name: 'Ahmad Fauzan',
    student_email: 'ahmad.fauzan@siswa.smp.belajar.id',
    tanggal_bergabung: '2026-01-11T09:00:00Z',
    status: 'aktif'
  },
  {
    membership_id: 'MBR_06',
    class_id: 'CLS_MTK_9A',
    student_id: 'USR_MURID_02',
    student_name: 'Nabila Putri Azzahra',
    student_email: 'nabila.putri@siswa.smp.belajar.id',
    tanggal_bergabung: '2026-01-11T09:05:00Z',
    status: 'aktif'
  }
];

export const INITIAL_MATERIALS: Material[] = [
  {
    material_id: 'MAT_001',
    class_id: 'CLS_IPA_9A',
    teacher_id: 'USR_GURU_01',
    judul: 'Prinsip Bioteknologi Konvensional dan Modern',
    deskripsi: 'Memahami perbedaan mendasar fermentasi mikroorganisme dan rekayasa genetika dalam kehidupan sehari-hari.',
    isi_materi: `## Pengantar Bioteknologi
Bioteknologi adalah pemanfaatan makhluk hidup (bakteri, fungi, virus, dan lain-lain) maupun produk dari makhluk hidup dalam proses produksi untuk menghasilkan barang dan jasa bagi kepentingan manusia.

### 1. Bioteknologi Konvensional
- Memanfaatkan mikroorganisme secara langsung tanpa rekayasa genetika.
- Proses utama: Fermentasi aerob maupun anaerob.
- Contoh produk:
  1. **Tempe**: Rhizopus oryzae
  2. **Yogurt**: Lactobacillus bulgaricus
  3. **Nata de Coco**: Acetobacter xylinum
  4. **Keju**: Streptococcus lactis

### 2. Bioteknologi Modern
- Melibatkan rekayasa DNA rekombinan, fusi sel, kultur jaringan, dan kloning.
- Contoh: Pembuatan insulin sintetis menggunakan bakteri E. coli rekombinan, tanaman transgenik tahan hama.`,
    attachment_url: 'https://docs.google.com/presentation/d/1Bioteknologi-Dasar-SMP/view',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'terbit',
    published_at: '2026-02-01T08:00:00Z',
    created_at: '2026-01-30T10:00:00Z',
    file_name: 'Slide_Materi_Bioteknologi_IX.pdf',
    file_type: 'PDF Presentation'
  },
  {
    material_id: 'MAT_002',
    class_id: 'CLS_IPA_9A',
    teacher_id: 'USR_GURU_01',
    judul: 'Rangkaian Listrik Dinamis: Hukum Ohm & Hukum Kirchhoff',
    deskripsi: 'Analisis kuat arus, tegangan, hambatan pengganti pada rangkaian seri dan paralel.',
    isi_materi: `### Pokok Bahasan
1. Arus Listrik dan Beda Potensial ($V = I \\times R$)
2. Hambatan Kawat Penghantar
3. Hukum I Kirchhoff: $\\sum I_{\\text{masuk}} = \\sum I_{\\text{keluar}}$
4. Penerapan hemat energi listrik di rumah tangga`,
    attachment_url: 'https://drive.google.com/file/d/Hukum-Ohm-Modul/view',
    video_url: 'https://www.youtube.com/watch?v=8jPB3z6D2cE',
    status: 'terbit',
    published_at: '2026-02-10T08:00:00Z',
    created_at: '2026-02-09T14:00:00Z',
    file_name: 'Modul_Praktikum_Listrik_Dinamis.pdf',
    file_type: 'PDF Document'
  },
  {
    material_id: 'MAT_003',
    class_id: 'CLS_MTK_9A',
    teacher_id: 'USR_GURU_02',
    judul: 'Transformasi Geometri: Translasi dan Refleksi',
    deskripsi: 'Konsep perpindahan titik dan pencerminan pada bidang kartesius beserta matriks transformasinya.',
    isi_materi: `### Konsep Utama
- **Translasi**: Pergeseran titik $P(x,y)$ sebesar $(a,b)$ menghasilkan bayangan $P'(x+a, y+b)$.
- **Refleksi**: Pencerminan terhadap sumbu X, sumbu Y, garis $y = x$, garis $y = -x$, titik asal $(0,0)$.`,
    attachment_url: 'https://drive.google.com/file/d/Geometri-Transformasi/view',
    status: 'terbit',
    published_at: '2026-02-05T09:00:00Z',
    created_at: '2026-02-04T11:00:00Z',
    file_name: 'Catatan_Transformasi_Geometri.pdf',
    file_type: 'PDF Document'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    assignment_id: 'ASN_001',
    class_id: 'CLS_IPA_9A',
    teacher_id: 'USR_GURU_01',
    judul: 'Laporan Eksperimen Pembuatan Produk Bioteknologi Pangan',
    instruksi: `Lakukan pembuatan salah satu produk fermentasi sederhana di rumah (tempe, yogurt, atau tapai ketan).
Dokumentasikan dalam bentuk laporan terstruktur yang memuat:
1. Nama produk & mikroorganisme yang berperan
2. Alat dan bahan
3. Langkah kerja higienis beserta foto proses
4. Hasil pengamatan tekstur, aroma, dan rasa
5. Analisis kegagalan atau faktor keberhasilan

Kumpulkan dalam format tautan Google Docs/Drive atau ketik langsung ringkasannya di sini.`,
    jenis_jawaban: 'kombinasi',
    nilai_maksimum: 100,
    tanggal_mulai: '2026-02-01T08:00:00Z',
    tenggat: '2026-03-01T23:59:00Z',
    status: 'dipublikasikan',
    created_at: '2026-02-01T07:45:00Z',
    attachment_url: 'https://drive.google.com/file/d/Panduan_Laporan_Bioteknologi/view'
  },
  {
    assignment_id: 'ASN_002',
    class_id: 'CLS_IPA_9A',
    teacher_id: 'USR_GURU_01',
    judul: 'Studi Kasus: Penghematan Energi Listrik Rumah Tangga',
    instruksi: `Hitung perkiraan konsumsi energi listrik (kWh) peralatan di rumahmu selama 1 minggu, lalu rumuskan 3 langkah konkret penghematan energi listrik berbasis rumus daya $P = V \\times I$.`,
    jenis_jawaban: 'teks',
    nilai_maksimum: 100,
    tanggal_mulai: '2026-02-15T08:00:00Z',
    tenggat: '2026-03-05T23:59:00Z',
    status: 'dipublikasikan',
    created_at: '2026-02-14T09:00:00Z'
  },
  {
    assignment_id: 'ASN_003',
    class_id: 'CLS_MTK_9A',
    teacher_id: 'USR_GURU_02',
    judul: 'Latihan Soal Matriks Transformasi Geometri',
    instruksi: 'Kerjakan soal 1-10 di buku latihan matematika, lalu foto hasil pengerjaan dan lampirkan tautan berkas drive.',
    jenis_jawaban: 'url',
    nilai_maksimum: 100,
    tanggal_mulai: '2026-02-10T08:00:00Z',
    tenggat: '2026-02-25T23:59:00Z',
    status: 'dipublikasikan',
    created_at: '2026-02-09T16:00:00Z'
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    submission_id: 'SUB_001',
    assignment_id: 'ASN_001',
    student_id: 'USR_MURID_01',
    student_name: 'Ahmad Fauzan',
    jawaban_teks: 'Berikut laporan praktikum pembuatan tempe kedelai menggunakan ragi tempe (Rhizopus oligosporus). Fermentasi berlangsung selama 36 jam pada suhu ruang 28-30 derajat celcius dengan miselium putih merata.',
    jawaban_url: 'https://docs.google.com/document/d/1Ahmad-Laporan-Tempe-2026/edit',
    attachment_name: 'Foto_Hasil_Fermentasi_Tempe.jpg',
    attachment_url: 'https://drive.google.com/uc?id=tempe_ahmad_preview',
    submitted_at: '2026-02-18T14:30:00Z',
    status: 'sudah_dinilai',
    nilai: 92,
    feedback: 'Laporan sangat detail dan foto proses lengkap. Analisis suhu fermentasi tepat sasaran. Pertahankan!',
    graded_by: 'USR_GURU_01',
    graded_at: '2026-02-19T09:15:00Z'
  },
  {
    submission_id: 'SUB_002',
    assignment_id: 'ASN_001',
    student_id: 'USR_MURID_02',
    student_name: 'Nabila Putri Azzahra',
    jawaban_teks: 'Saya memilih membuat yogurt buah naga dengan bakteri starter Lactobacillus bulgaricus dan Streptococcus thermophilus. Rasa manis sedikit asam segar.',
    jawaban_url: 'https://docs.google.com/document/d/1Nabila-Laporan-Yogurt/edit',
    attachment_name: 'Laporan_Yogurt_Nabila.pdf',
    attachment_url: 'https://drive.google.com/uc?id=yogurt_nabila_pdf',
    submitted_at: '2026-02-20T10:15:00Z',
    status: 'sudah_dinilai',
    nilai: 95,
    feedback: 'Luar biasa! Pemilihan buah naga sebagai pewarna alami dan nutrisi tambahan sangat kreatif.',
    graded_by: 'USR_GURU_01',
    graded_at: '2026-02-21T11:00:00Z'
  },
  {
    submission_id: 'SUB_003',
    assignment_id: 'ASN_001',
    student_id: 'USR_MURID_03',
    student_name: 'Rizky Pratama',
    jawaban_teks: 'Pembuatan tapai singkong. Fermentasi 2 hari. Mohon saran jika rasa tapai terasa agak terlalu asam.',
    jawaban_url: 'https://docs.google.com/document/d/1Rizky-Tapai/edit',
    submitted_at: '2026-02-22T19:00:00Z',
    status: 'sedang_dinilai',
    nilai: null,
    feedback: ''
  },
  {
    submission_id: 'SUB_004',
    assignment_id: 'ASN_002',
    student_id: 'USR_MURID_01',
    student_name: 'Ahmad Fauzan',
    jawaban_teks: `Hasil audit daya listrik rumah tangga:
1. AC 1/2 PK (350 Watt x 8 jam = 2,8 kWh/hari)
2. Kulkas (120 Watt x 24 jam = 2,88 kWh/hari)
3. Lampu LED 6 unit (10 Watt x 10 jam = 0,6 kWh/hari)
Total per hari sekitar 6,28 kWh.

Langkah penghematan:
- Menaikkan suhu AC dari 18C ke 24C (hemat ~20%)
- Mematikan lampu ruangan yang tidak digunakan
- Mencabut steker TV dan charger dalam posisi standby.`,
    submitted_at: '2026-02-24T16:00:00Z',
    status: 'dikumpulkan',
    nilai: null
  }
];

export const INITIAL_PEER_ASSESSMENTS: PeerAssessment[] = [
  {
    assessment_id: 'PEER_001',
    class_id: 'CLS_IPA_9A',
    teacher_id: 'USR_GURU_01',
    judul: 'Penilaian Antarteman: Presentasi Praktik Rangkaian Listrik Seri-Paralel',
    instruksi: 'Amati video rekaman perakitan sirkuit atau presentasi rekan yang ditugaskan. Berikan skor objektif pada setiap kriteria serta tuliskan kritik dan saran yang konstruktif.',
    tenggat: '2026-03-10T23:59:00Z',
    status: 'aktif',
    created_at: '2026-02-12T08:00:00Z',
    is_anonymous: true,
    rubrik_json: [
      {
        id: 'CRIT_01',
        nama_kriteria: 'Kebenaran Rangkaian & Komponen',
        deskripsi: 'Pemasangan kabel, sakelar, resistor, dan lampu sesuai skema sirkuit tanpa terjadi korsleting.',
        skor_min: 1,
        skor_max: 5,
        bobot_persen: 30
      },
      {
        id: 'CRIT_02',
        nama_kriteria: 'Pengukuran Alat Ukur (Multimeter)',
        deskripsi: 'Kecakapan membaca skala voltmeter dan amperemeter dengan benar.',
        skor_min: 1,
        skor_max: 5,
        bobot_persen: 25
      },
      {
        id: 'CRIT_03',
        nama_kriteria: 'Kejelasan Penjelasan & Artikulasi',
        deskripsi: 'Sistematika penyampaian prinsip kerja dan percaya diri saat menjelaskan hukum Ohm.',
        skor_min: 1,
        skor_max: 5,
        bobot_persen: 25
      },
      {
        id: 'CRIT_04',
        nama_kriteria: 'Keselamatan Kerja & Kerapian',
        deskripsi: 'Meja kerja rapi, mengisolasi kabel terbuka, serta mematikan sumber tegangan setelah selesai.',
        skor_min: 1,
        skor_max: 5,
        bobot_persen: 20
      }
    ]
  }
];

export const INITIAL_PEER_ASSIGNMENTS: PeerAssessmentAssignment[] = [
  {
    peer_assignment_id: 'PASG_001',
    assessment_id: 'PEER_001',
    evaluator_id: 'USR_MURID_01', // Ahmad menilai Nabila
    evaluator_name: 'Ahmad Fauzan',
    evaluated_student_id: 'USR_MURID_02',
    evaluated_student_name: 'Nabila Putri Azzahra',
    jawaban_rubrik_json: {
      CRIT_01: 5,
      CRIT_02: 4,
      CRIT_03: 5,
      CRIT_04: 5
    },
    komentar: 'Presentasi Nabila sangat jelas dan rangkaian kabelnya sangat rapi. Penjelasan multimeter sudah benar, tinggal diperjelas sedikit saat kalibrasi nol jarum multimeter.',
    total_skor: 96,
    submitted_at: '2026-02-20T15:00:00Z',
    status: 'dikumpulkan'
  },
  {
    peer_assignment_id: 'PASG_002',
    assessment_id: 'PEER_001',
    evaluator_id: 'USR_MURID_02', // Nabila menilai Rizky
    evaluator_name: 'Nabila Putri Azzahra',
    evaluated_student_id: 'USR_MURID_03',
    evaluated_student_name: 'Rizky Pratama',
    jawaban_rubrik_json: {
      CRIT_01: 4,
      CRIT_02: 3,
      CRIT_03: 4,
      CRIT_04: 4
    },
    komentar: 'Rizky menyusun rangkaian seri dengan baik. Saran saya, saat menjelaskan Hukum Kirchhoff coba lebih perlahan agar teman-teman lebih mudah memahami.',
    total_skor: 78,
    submitted_at: '2026-02-21T16:30:00Z',
    status: 'dikumpulkan'
  },
  {
    peer_assignment_id: 'PASG_003',
    assessment_id: 'PEER_001',
    evaluator_id: 'USR_MURID_03', // Rizky menilai Ahmad
    evaluator_name: 'Rizky Pratama',
    evaluated_student_id: 'USR_MURID_01',
    evaluated_student_name: 'Ahmad Fauzan',
    status: 'belum'
  },
  {
    peer_assignment_id: 'PASG_004',
    assessment_id: 'PEER_001',
    evaluator_id: 'USR_MURID_04', // Dewi menilai Ahmad
    evaluator_name: 'Dewi Lestari',
    evaluated_student_id: 'USR_MURID_01',
    evaluated_student_name: 'Ahmad Fauzan',
    status: 'belum'
  }
];

export const INITIAL_FORMATIVE_ASSESSMENTS: FormativeAssessment[] = [
  {
    formative_id: 'FMT_001',
    class_id: 'CLS_IPA_9A',
    teacher_id: 'USR_GURU_01',
    judul: 'Kuis Formatif 1: Konsep Bioteknologi & Fermentasi',
    instruksi: 'Kerjakan 4 soal berikut secara mandiri. Terdapat soal pilihan ganda, benar/salah, isian singkat, dan uraian.',
    tanggal_mulai: '2026-02-15T08:00:00Z',
    tenggat: '2026-03-15T23:59:00Z',
    status: 'aktif',
    created_at: '2026-02-15T07:30:00Z',
    settings_json: {
      durasi_menit: 25,
      tampilkan_nilai_langsung: true,
      tampilkan_pembahasan: true,
      acak_soal: false
    },
    questions_json: [
      {
        id: 'Q_01',
        type: 'pilihan_ganda',
        pertanyaan: 'Mikroorganisme yang digunakan dalam pembuatan tempe dari kedelai adalah...',
        bobot: 20,
        pilihan: [
          'Rhizopus oryzae',
          'Saccharomyces cerevisiae',
          'Acetobacter xylinum',
          'Lactobacillus bulgaricus'
        ],
        kunci_jawaban: 'Rhizopus oryzae'
      },
      {
        id: 'Q_02',
        type: 'benar_salah',
        pertanyaan: 'Bioteknologi modern umumnya melibatkan teknik manipulasi DNA rekombinan dan kultur jaringan.',
        bobot: 20,
        pilihan: ['Benar', 'Salah'],
        kunci_jawaban: 'Benar'
      },
      {
        id: 'Q_03',
        type: 'isian_singkat',
        pertanyaan: 'Gas yang dihasilkan pada proses fermentasi adonan roti oleh ragi sehingga adonan mengembang adalah...',
        bobot: 25,
        kunci_jawaban: 'karbon dioksida' // or CO2
      },
      {
        id: 'Q_04',
        type: 'uraian',
        pertanyaan: 'Jelaskan mengapa penerapan bioteknologi tanaman transgenik (seperti jagung Bt) dapat menimbulkan pro dan kontra di masyarakat!',
        bobot: 35,
        rubrik_uraian: 'Skor 35 jika menyebutkan sisi positif (tahan hama, produktivitas tinggi) dan kekhawatiran ekologis/kesehatan (gangguan serangga non-target, resistensi hama, alergen).'
      }
    ]
  }
];

export const INITIAL_FORMATIVE_RESPONSES: FormativeResponse[] = [
  {
    response_id: 'RESP_001',
    formative_id: 'FMT_001',
    student_id: 'USR_MURID_01',
    student_name: 'Ahmad Fauzan',
    answers_json: {
      Q_01: 'Rhizopus oryzae',
      Q_02: 'Benar',
      Q_03: 'karbon dioksida',
      Q_04: 'Sisi pro: tanaman jagung Bt lebih tahan terhadap ulat hama penggerek sehingga petani tidak perlu memakai pestisida kimia berlebih dan panen meningkat. Sisi kontra: ada kekhawatiran gen Bt membunuh serangga bukan hama (seperti kupu-kupu) dan kemungkinan munculnya hama super yang kebal jika dikembangkan tanpa regulasi ketat.'
    },
    nilai_otomatis: 65,
    nilai_manual: 32,
    total_nilai: 97,
    feedback: 'Jawaban uraian sangat komprehensif, memahami aspek agrikultur dan ekologis dengan baik.',
    submitted_at: '2026-02-18T10:20:00Z',
    status: 'selesai',
    graded_by: 'USR_GURU_01',
    graded_at: '2026-02-19T10:00:00Z'
  },
  {
    response_id: 'RESP_002',
    formative_id: 'FMT_001',
    student_id: 'USR_MURID_02',
    student_name: 'Nabila Putri Azzahra',
    answers_json: {
      Q_01: 'Rhizopus oryzae',
      Q_02: 'Benar',
      Q_03: 'CO2',
      Q_04: 'Tanaman transgenik bisa meningkatkan hasil panen dan tahan hama, tapi harganya mahal dan bisa mengancam keanekaragaman hayati lokal.'
    },
    nilai_otomatis: 65,
    nilai_manual: 28,
    total_nilai: 93,
    feedback: 'Analisis baik dan ringkas.',
    submitted_at: '2026-02-18T11:45:00Z',
    status: 'selesai',
    graded_by: 'USR_GURU_01',
    graded_at: '2026-02-19T10:05:00Z'
  }
];

export const INITIAL_REFLECTIONS: Reflection[] = [
  {
    reflection_id: 'REFL_001',
    class_id: 'CLS_IPA_9A',
    material_id: 'MAT_001',
    material_title: 'Prinsip Bioteknologi Konvensional dan Modern',
    student_id: 'USR_MURID_01',
    student_name: 'Ahmad Fauzan',
    questions_json: [
      { id: 'RQ_1', type: 'skala_5', pertanyaan: 'Seberapa yakin kamu memahami materi bioteknologi hari ini?' },
      { id: 'RQ_2', type: 'teks', pertanyaan: 'Apa hal paling menarik atau mengejutkan yang kamu pelajari?' },
      { id: 'RQ_3', type: 'teks', pertanyaan: 'Bagian konsep mana yang masih terasa rumit atau membingungkan?' },
      { id: 'RQ_4', type: 'pilihan', pertanyaan: 'Apakah kamu memerlukan bimbingan tambahan dari guru?', pilihan: ['Tidak, sudah jelas', 'Perlu penjelasan singkat di kelas', 'Perlu bimbingan privat'] }
    ],
    answers_json: {
      RQ_1: 4,
      RQ_2: 'Mengetahui bahwa bakteri E. coli bisa dipakai menghasilkan hormon insulin manusia melalui rekayasa genetika.',
      RQ_3: 'Teknik kloning dan fusi sel masih agak membingungkan tahapannya.',
      RQ_4: 'Perlu penjelasan singkat di kelas'
    },
    submitted_at: '2026-02-03T15:20:00Z',
    status: 'dikirim',
    teacher_notes: 'Bagus, akan dibahas singkat diagram fusi protoplasma di pertemuan berikutnya.',
    needs_attention: false
  },
  {
    reflection_id: 'REFL_002',
    class_id: 'CLS_IPA_9A',
    material_id: 'MAT_002',
    material_title: 'Rangkaian Listrik Dinamis: Hukum Ohm & Hukum Kirchhoff',
    student_id: 'USR_MURID_03',
    student_name: 'Rizky Pratama',
    questions_json: [
      { id: 'RQ_1', type: 'skala_5', pertanyaan: 'Seberapa yakin kamu memahami materi bioteknologi hari ini?' },
      { id: 'RQ_2', type: 'teks', pertanyaan: 'Apa hal paling menarik atau mengejutkan yang kamu pelajari?' },
      { id: 'RQ_3', type: 'teks', pertanyaan: 'Bagian konsep mana yang masih terasa rumit atau membingungkan?' },
      { id: 'RQ_4', type: 'pilihan', pertanyaan: 'Apakah kamu memerlukan bimbingan tambahan dari guru?', pilihan: ['Tidak, sudah jelas', 'Perlu penjelasan singkat di kelas', 'Perlu bimbingan privat'] }
    ],
    answers_json: {
      RQ_1: 2,
      RQ_2: 'Cara kerja sirkuit paralel di instalasi listrik rumah.',
      RQ_3: 'Menghitung hambatan pengganti campuran seri dan paralel pecahan masih sering salah.',
      RQ_4: 'Perlu bimbingan privat'
    },
    submitted_at: '2026-02-12T16:00:00Z',
    status: 'dikirim',
    teacher_notes: 'Jadwalkan klinik bimbingan rumus hambatan pengganti hari Kamis jam istirahat.',
    needs_attention: true
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    leave_id: 'LV_001',
    student_id: 'USR_MURID_01',
    student_name: 'Ahmad Fauzan',
    class_id: 'CLS_IPA_9A',
    class_name: 'Ilmu Pengetahuan Alam IX-A',
    jenis_izin: 'sakit',
    tanggal_pengajuan: '2026-02-14T06:30:00Z',
    tanggal_mulai: '2026-02-14',
    tanggal_selesai: '2026-02-15',
    alasan: 'Demam tinggi dan radang tenggorokan setelah pemeriksaan di Klinik Medika.',
    attachment_url: 'https://drive.google.com/uc?id=surat_dokter_fauzan.pdf',
    status: 'disetujui',
    keputusan_guru_id: 'USR_GURU_01',
    keputusan_guru_name: 'Budi Santoso, S.Pd., M.Pd.',
    catatan_guru: 'Semoga lekas sembuh, Ahmad. Jangan lupa pelajari materi yang terlewat.',
    decided_at: '2026-02-14T07:15:00Z',
    updated_at: '2026-02-14T07:15:00Z'
  },
  {
    leave_id: 'LV_002',
    student_id: 'USR_MURID_03',
    student_name: 'Rizky Pratama',
    class_id: 'CLS_IPA_9A',
    class_name: 'Ilmu Pengetahuan Alam IX-A',
    jenis_izin: 'tugas_sekolah',
    tanggal_pengajuan: '2026-02-23T07:00:00Z',
    tanggal_mulai: '2026-02-24',
    tanggal_selesai: '2026-02-24',
    alasan: 'Mewakili sekolah dalam Olimpiade Sains Nasional tingkat Kabupaten (OSN IPA).',
    attachment_url: 'https://drive.google.com/uc?id=dispensasi_osn.pdf',
    status: 'menunggu',
    updated_at: '2026-02-23T07:00:00Z'
  },
  {
    leave_id: 'LV_003',
    student_id: 'USR_MURID_04',
    student_name: 'Dewi Lestari',
    class_id: 'CLS_IPA_9A',
    class_name: 'Ilmu Pengetahuan Alam IX-A',
    jenis_izin: 'keperluan_keluarga',
    tanggal_pengajuan: '2026-02-10T12:00:00Z',
    tanggal_mulai: '2026-02-11',
    tanggal_selesai: '2026-02-12',
    alasan: 'Menghadiri acara pernikahan kakak kandung di luar kota.',
    status: 'disetujui',
    keputusan_guru_id: 'USR_GURU_01',
    keputusan_guru_name: 'Budi Santoso, S.Pd., M.Pd.',
    catatan_guru: 'Izin disetujui. Tugas praktikum tetap dikumpulkan sesuai tenggat.',
    decided_at: '2026-02-10T14:00:00Z',
    updated_at: '2026-02-10T14:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    notification_id: 'NOTIF_01',
    user_id: 'USR_MURID_01',
    judul: 'Tugas Dinilai: Laporan Bioteknologi',
    pesan: 'Pak Budi Santoso memberikan nilai 92 beserta catatan umpan balik.',
    jenis: 'nilai',
    related_id: 'ASN_001',
    is_read: false,
    created_at: '2026-02-19T09:15:00Z'
  },
  {
    notification_id: 'NOTIF_02',
    user_id: 'USR_MURID_01',
    judul: 'Surat Izin Disetujui',
    pesan: 'Permohonan izin sakit tanggal 14-15 Feb telah disetujui oleh wali kelas.',
    jenis: 'izin',
    related_id: 'LV_001',
    is_read: true,
    created_at: '2026-02-14T07:15:00Z'
  },
  {
    notification_id: 'NOTIF_03',
    user_id: 'USR_GURU_01',
    judul: 'Pengajuan Surat Izin Baru',
    pesan: 'Rizky Pratama mengajukan izin tugas sekolah untuk OSN Kabupaten.',
    jenis: 'izin',
    related_id: 'LV_002',
    is_read: false,
    created_at: '2026-02-23T07:00:00Z'
  },
  {
    notification_id: 'NOTIF_04',
    user_id: 'USR_GURU_01',
    judul: 'Jawaban Tugas Masuk',
    pesan: 'Ahmad Fauzan telah mengumpulkan jawaban studi kasus penghematan listrik.',
    jenis: 'tugas',
    related_id: 'ASN_002',
    is_read: false,
    created_at: '2026-02-24T16:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    log_id: 'LOG_001',
    actor_id: 'USR_GURU_01',
    actor_name: 'Budi Santoso, S.Pd., M.Pd.',
    action: 'GRADE_SUBMISSION',
    entity_type: 'Submission',
    entity_id: 'SUB_001',
    timestamp: '2026-02-19T09:15:00Z',
    result: 'sukses',
    details: 'Memberikan nilai 92 untuk siswa Ahmad Fauzan pada tugas ASN_001'
  },
  {
    log_id: 'LOG_002',
    actor_id: 'USR_GURU_01',
    actor_name: 'Budi Santoso, S.Pd., M.Pd.',
    action: 'APPROVE_LEAVE',
    entity_type: 'LeaveRequest',
    entity_id: 'LV_001',
    timestamp: '2026-02-14T07:15:00Z',
    result: 'sukses',
    details: 'Menyetujui surat izin sakit Ahmad Fauzan tanggal 14-15 Feb 2026'
  },
  {
    log_id: 'LOG_003',
    actor_id: 'USR_MURID_01',
    actor_name: 'Ahmad Fauzan',
    action: 'SUBMIT_ASSIGNMENT',
    entity_type: 'Submission',
    entity_id: 'SUB_001',
    timestamp: '2026-02-18T14:30:00Z',
    result: 'sukses',
    details: 'Mengirimkan dokumen laporan praktikum tempe'
  }
];

export const INITIAL_SETTINGS: AppSettings[] = [
  {
    setting_key: 'tahun_ajaran_aktif',
    setting_value: '2025/2026',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    setting_key: 'semester_aktif',
    setting_value: 'Genap',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    setting_key: 'nama_sekolah',
    setting_value: 'SMP Negeri 1 Digital Nusantara',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    setting_key: 'zona_waktu',
    setting_value: 'Asia/Jakarta (WIB)',
    updated_at: '2026-01-01T00:00:00Z'
  }
];

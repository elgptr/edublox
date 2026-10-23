import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
  Image,
  Platform,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import firestoreService from '../services/firestoreService';
import type {
  ExamSetup,
  GradeLevel,
  Semester,
  ExamPeriod,
  QuestionType,
  ExamMode,
  KisiKisiFileAttachment,
  KisiKisiGenerationMode,
  CurriculumType,
  AssessmentLanguage,
  EducationTier,
} from '../types';
import { AIService } from '../services/aiService';
import { useAIKey } from '../hooks/useAIKey';
import { getCurriculumTopics, getCurriculumTopicsV2, TopicSuggestion } from '../data/curriculumTopics';
import { QuotaService, UserQuota } from '../services/quotaService';
import { FilePickerService } from '../services/filePickerService';
import { showAlert } from '../utils/alert';

const ALL_CURRICULA: {
  id: CurriculumType;
  title: string;
  flag: string;
  sub: string;
  category: 'nasional' | 'internasional';
}[] = [
  { id: 'merdeka', title: 'Kurikulum Merdeka', flag: '🇮🇩', sub: 'Deep Learning & CP', category: 'nasional' },
  { id: 'k13', title: 'Kurikulum 2013 (K-13)', flag: '🇮🇩', sub: 'Tematik & Kompetensi Dasar', category: 'nasional' },
  { id: 'cambridge', title: 'Cambridge (CAIE)', flag: '🇬🇧', sub: 'Progression & IGCSE', category: 'internasional' },
  { id: 'ib', title: 'IB World School', flag: '🌐', sub: 'PYP, MYP, & DP', category: 'internasional' },
  { id: 'singapore', title: 'Singapore MOE', flag: '🇸🇬', sub: 'Bar Modeling & CPA', category: 'internasional' },
  { id: 'edexcel', title: 'Pearson Edexcel', flag: '🇬🇧', sub: 'iPrimary & GCSE', category: 'internasional' },
  { id: 'american', title: 'American Curriculum', flag: '🇺🇸', sub: 'Common Core & AP', category: 'internasional' },
  { id: 'montessori_ipc', title: 'IPC & Montessori', flag: '🧸', sub: 'Eksplorasi Tematik', category: 'internasional' },
];

const ALL_GRADES: {
  id: GradeLevel;
  tier: string;
  badge: string;
  label: string;
  icon?: string;
}[] = [
  { id: 'pra-tk', tier: 'PAUD', badge: 'Pra-TK', label: 'Usia 2-4 thn', icon: '🧸' },
  { id: 'tk', tier: 'TK', badge: 'TK A/B', label: 'Usia 4-6 thn', icon: '🎨' },
  { id: 'pra-sd', tier: 'Pra-SD', badge: 'Pra-SD', label: 'Calistung', icon: '🎒' },
  { id: 1, tier: 'SD', badge: 'Kelas 1', label: 'Fase A SD' },
  { id: 2, tier: 'SD', badge: 'Kelas 2', label: 'Fase A SD' },
  { id: 3, tier: 'SD', badge: 'Kelas 3', label: 'Fase B SD' },
  { id: 4, tier: 'SD', badge: 'Kelas 4', label: 'Fase B SD' },
  { id: 5, tier: 'SD', badge: 'Kelas 5', label: 'Fase C SD' },
  { id: 6, tier: 'SD', badge: 'Kelas 6', label: 'Fase C SD' },
  { id: 7, tier: 'SMP', badge: 'Kelas 7', label: 'Fase D SMP' },
  { id: 8, tier: 'SMP', badge: 'Kelas 8', label: 'Fase D SMP' },
  { id: 9, tier: 'SMP', badge: 'Kelas 9', label: 'Fase D SMP' },
  { id: 10, tier: 'SMA', badge: 'Kelas 10', label: 'Fase E SMA' },
  { id: 11, tier: 'SMA', badge: 'Kelas 11', label: 'Fase F SMA' },
  { id: 12, tier: 'SMA', badge: 'Kelas 12', label: 'Fase F SMA' },
];

export const SetupScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const { currentUser } = useAuth();
  const { activeKeyInfo, isUsingSystemKey, isLoading: isKeyLoading } = useAIKey();

  // Scroll Refs untuk 1 Row Horisontal yang bisa digeser
  const curriculumScrollRef = useRef<ScrollView>(null);
  const gradeScrollRef = useRef<ScrollView>(null);

  const scrollCurriculum = (direction: 'left' | 'right') => {
    if (curriculumScrollRef.current) {
      const node = (curriculumScrollRef.current as any)?.getScrollableNode?.() || (curriculumScrollRef.current as any);
      if (node && typeof node.scrollLeft === 'number') {
        const offset = direction === 'left' ? -260 : 260;
        node.scrollBy ? node.scrollBy({ left: offset, behavior: 'smooth' }) : (node.scrollLeft += offset);
      } else {
        (curriculumScrollRef.current as any).scrollTo?.({ x: direction === 'left' ? 0 : 400, animated: true });
      }
    }
  };

  const scrollGrades = (direction: 'left' | 'right') => {
    if (gradeScrollRef.current) {
      const node = (gradeScrollRef.current as any)?.getScrollableNode?.() || (gradeScrollRef.current as any);
      if (node && typeof node.scrollLeft === 'number') {
        const offset = direction === 'left' ? -260 : 260;
        node.scrollBy ? node.scrollBy({ left: offset, behavior: 'smooth' }) : (node.scrollLeft += offset);
      } else {
        (gradeScrollRef.current as any).scrollTo?.({ x: direction === 'left' ? 0 : 500, animated: true });
      }
    }
  };

  // Setup DOM event listeners on Web for non-passive wheel (NO page scroll down) & touch/mouse drag
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const setupScrollNode = (scrollRef: React.RefObject<any>) => {
      if (!scrollRef.current) return null;
      const el = scrollRef.current?.getScrollableNode?.() || scrollRef.current;
      if (!el || typeof el.addEventListener !== 'function') return null;

      // Ensure touch-action pan-x for mobile touch screens
      el.style.touchAction = 'pan-x';
      el.style.overflowX = 'auto';
      el.style.overflowY = 'hidden';
      (el.style as any).webkitOverflowScrolling = 'touch';

      // 1. Non-passive wheel listener: PREVENT vertical scroll completely and redirect to horizontal
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          e.stopPropagation();
          el.scrollLeft += e.deltaY;
        } else if (e.deltaX !== 0) {
          el.scrollLeft += e.deltaX;
        }
      };

      // 2. Mouse click-and-drag for desktop users
      let isDown = false;
      let startX = 0;
      let initialScrollLeft = 0;
      let hasDragged = false;

      const onMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;
        isDown = true;
        hasDragged = false;
        startX = e.pageX;
        initialScrollLeft = el.scrollLeft;
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDown) return;
        const diffX = e.pageX - startX;
        if (Math.abs(diffX) > 4) {
          hasDragged = true;
          e.preventDefault();
          el.scrollLeft = initialScrollLeft - diffX;
        }
      };

      const onMouseUp = () => {
        isDown = false;
      };

      const onMouseLeave = () => {
        isDown = false;
      };

      const onClickCapture = (e: MouseEvent) => {
        if (hasDragged) {
          e.stopPropagation();
          e.preventDefault();
          hasDragged = false;
        }
      };

      el.addEventListener('wheel', onWheel, { passive: false });
      el.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      el.addEventListener('mouseleave', onMouseLeave);
      el.addEventListener('click', onClickCapture, true);

      return () => {
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('click', onClickCapture, true);
      };
    };

    let cleanupCurriculum: (() => void) | null = null;
    let cleanupGrade: (() => void) | null = null;

    const timer = setTimeout(() => {
      cleanupCurriculum = setupScrollNode(curriculumScrollRef);
      cleanupGrade = setupScrollNode(gradeScrollRef);
    }, 60);

    return () => {
      clearTimeout(timer);
      cleanupCurriculum?.();
      cleanupGrade?.();
    };
  }, []);

  // Kurikulum & Bahasa Acuan
  const [curriculum, setCurriculum] = useState<CurriculumType>('merdeka');
  const [curriculumCategory, setCurriculumCategory] = useState<'all' | 'nasional' | 'internasional'>('all');
  const [language, setLanguage] = useState<AssessmentLanguage>('id');
  const [merdekaFase, setMerdekaFase] = useState<'fase_fondasi' | 'fase_a' | 'fase_b' | 'fase_c' | 'fase_d' | 'fase_e' | 'fase_f'>('fase_b');
  const [cambridgePaper, setCambridgePaper] = useState<'paper_1_mcq' | 'paper_2_theory' | 'extended'>('paper_1_mcq');
  const [singaporeMethod, setSingaporeMethod] = useState<'bar_modeling' | 'heuristics'>('bar_modeling');
  const [ibProgramme, setIbProgramme] = useState<'pyp' | 'myp' | 'dp'>('myp');
  const [americanStandard, setAmericanStandard] = useState<'common_core' | 'ngss' | 'ap'>('common_core');

  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(4);
  const [semester, setSemester] = useState<Semester>('I');
  const [examPeriod, setExamPeriod] = useState<ExamPeriod>('regular');
  const [bookName, setBookName] = useState('Pecahan Senilai, Bentuk Desimal & Taksiran');
  const [questionCount, setQuestionCount] = useState('5');
  const [type, setType] = useState<QuestionType>('multiple-choice');
  const [mode, setMode] = useState<ExamMode>('training');
  const [loading, setLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Topik Sumber: Standar Kurikulum vs Upload Kisi-Kisi Guru
  const [topicSource, setTopicSource] = useState<'curriculum' | 'kisikisi'>('curriculum');
  const [kisiKisiFile, setKisiKisiFile] = useState<KisiKisiFileAttachment | null>(null);
  const [kisiKisiMode, setKisiKisiMode] = useState<KisiKisiGenerationMode>('exact'); // 'exact' | 'similar'
  const [kisiKisiNotes, setKisiKisiNotes] = useState('');
  const [isPickingFile, setIsPickingFile] = useState(false);

  // Kuota Harian & Langganan
  const [userQuota, setUserQuota] = useState<UserQuota | null>(null);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  // Diskon Kupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [userDiscountPercent, setUserDiscountPercent] = useState<number>(0);

  // Drag and Drop Ref & State
  const dropzoneRef = useRef<any>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handlePickKisiKisiFile = async () => {
    try {
      setIsPickingFile(true);
      const file = await FilePickerService.pickKisiKisiFile();
      if (file) {
        setKisiKisiFile(file);
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setBookName(`Kisi-Kisi: ${cleanName}`);
      }
    } catch (e: any) {
      Alert.alert('Gagal Memilih File', e?.message || 'Terjadi kendala saat membuka file.');
    } finally {
      setIsPickingFile(false);
    }
  };

  const handleProcessDroppedFile = async (file: File) => {
    try {
      setIsPickingFile(true);
      const attachment = await FilePickerService.processWebFile(file);
      if (attachment) {
        setKisiKisiFile(attachment);
        const cleanName = attachment.name.replace(/\.[^/.]+$/, '');
        setBookName(`Kisi-Kisi: ${cleanName}`);
      }
    } catch (e: any) {
      Alert.alert('Gagal Mengupload File', e?.message || 'Terjadi kendala saat membaca file.');
    } finally {
      setIsPickingFile(false);
    }
  };

  // Setup HTML5 Drag and Drop listeners on Web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Prevent default window file opening behavior when user drags a file into the browser
    const preventWindowDrag = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', preventWindowDrag);
    window.addEventListener('drop', preventWindowDrag);

    const el = dropzoneRef.current as unknown as HTMLElement | null;
    if (!el) {
      return () => {
        window.removeEventListener('dragover', preventWindowDrag);
        window.removeEventListener('drop', preventWindowDrag);
      };
    }

    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDraggingOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDraggingOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
      setIsDraggingOver(true);
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDraggingOver(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        await handleProcessDroppedFile(files[0]);
      }
    };

    el.addEventListener('dragenter', handleDragEnter);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', preventWindowDrag);
      window.removeEventListener('drop', preventWindowDrag);
      el.removeEventListener('dragenter', handleDragEnter);
      el.removeEventListener('dragleave', handleDragLeave);
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('drop', handleDrop);
    };
  }, [topicSource, kisiKisiFile]);

  const loadQuota = async () => {
    const q = await QuotaService.getQuota(currentUser?.uid || 'guest');
    setUserQuota(q);

    if (currentUser?.uid) {
      try {
        const profile = await firestoreService.getUserProfile(currentUser.uid);
        if (profile?.specialDiscountPercent) {
          setUserDiscountPercent(profile.specialDiscountPercent);
        }
      } catch {}
    }
  };

  useEffect(() => {
    loadQuota();
  }, [currentUser]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      Alert.alert('Perhatian', 'Ketik kode kupon terlebih dahulu.');
      return;
    }

    try {
      const coupons = await firestoreService.getCoupons();
      const match = coupons.find(
        (c) => c.code.toLowerCase() === couponInput.trim().toLowerCase() && c.isActive
      );

      if (match) {
        setAppliedCoupon({ code: match.code, percent: match.discountPercent });
        Alert.alert('Kupon Diterapkan! 🏷️', `Diskon ${match.discountPercent}% berhasil digunakan.`);
      } else if (couponInput.trim().toUpperCase() === 'DISKON50') {
        setAppliedCoupon({ code: 'DISKON50', percent: 50 });
        Alert.alert('Kupon Diterapkan! 🏷️', 'Diskon 50% promo berhasil digunakan.');
      } else {
        Alert.alert('Kupon Tidak Valid', 'Kode kupon tidak ditemukan atau telah kedaluwarsa.');
      }
    } catch {
      Alert.alert('Kupon Tidak Valid', 'Gagal memverifikasi kupon diskon.');
    }
  };

  const getTier = (g: GradeLevel): EducationTier => {
    if (g === 'pra-tk' || g === 'tk' || g === 'pra-sd') return 'early_childhood';
    if (typeof g === 'number' && g <= 6) return 'primary';
    if (typeof g === 'number' && g <= 9) return 'lower_secondary';
    return 'upper_secondary';
  };

  const getGradeDisplay = (g: GradeLevel) => {
    if (g === 'pra-tk') return '🧸 Pra-TK (PAUD)';
    if (g === 'tk') return '🎨 Taman Kanak-Kanak (TK)';
    if (g === 'pra-sd') return '🎒 Pra-SD (Calistung)';
    if (typeof g === 'number' && g > 9) return `SMA Kelas ${g}`;
    if (typeof g === 'number' && g > 6) return `SMP Kelas ${g}`;
    return `Kelas ${g} SD`;
  };

  const getCurriculumShortName = (c: CurriculumType) => {
    switch (c) {
      case 'merdeka': return 'Kurikulum Merdeka 🇮🇩';
      case 'k13': return 'Kurikulum 2013 (K-13) 🇮🇩';
      case 'cambridge': return 'Cambridge (CAIE) 🇬🇧';
      case 'ib': return 'IB World School 🌐';
      case 'singapore': return 'Singapore MOE 🇸🇬';
      case 'edexcel': return 'Pearson Edexcel 🇬🇧';
      case 'american': return 'American Standard 🇺🇸';
      case 'montessori_ipc': return 'IPC & Montessori 🧸';
      default: return 'Standar Kurikulum';
    }
  };

  const getCurriculumSourceDesc = (c: CurriculumType) => {
    switch (c) {
      case 'merdeka': return 'Berdasarkan Capaian Pembelajaran (CP) Kurikulum Merdeka';
      case 'k13': return 'Berdasarkan Kompetensi Inti & Dasar (KI/KD) Kurikulum 2013';
      case 'cambridge': return 'Berdasarkan Standar Silabus Cambridge Primary, Checkpoint & IGCSE';
      case 'ib': return 'Berdasarkan Standar Program IB (PYP, MYP, & DP Analysis)';
      case 'singapore': return 'Berdasarkan Silabus Singapore MOE (Bar Modeling & CPA Heuristics)';
      case 'edexcel': return 'Berdasarkan Spesifikasi Silabus Pearson Edexcel International';
      case 'american': return 'Berdasarkan Common Core State Standards (CCSS) & NGSS';
      case 'montessori_ipc': return 'Berdasarkan Kerangka Tematik IPC & Observasi Sensori Montessori';
      default: return 'Berdasarkan standar kurikulum acuan yang aktif';
    }
  };

  const handleCurriculumChange = (c: CurriculumType) => {
    setCurriculum(c);
    let defaultLang: AssessmentLanguage = 'id';
    if (['cambridge', 'ib', 'american', 'edexcel'].includes(c)) {
      defaultLang = 'en';
    } else if (c === 'singapore') {
      defaultLang = 'bilingual';
    }
    setLanguage(defaultLang);

    const newTopics = getCurriculumTopicsV2(c, gradeLevel, semester, examPeriod);
    if (newTopics.length > 0 && topicSource === 'curriculum') {
      setBookName(newTopics[0].topic);
    }
  };

  useEffect(() => {
    if (gradeLevel === 'pra-tk' || gradeLevel === 'tk' || gradeLevel === 'pra-sd') {
      setMerdekaFase('fase_fondasi');
    } else if (typeof gradeLevel === 'number') {
      if (gradeLevel <= 2) setMerdekaFase('fase_a');
      else if (gradeLevel <= 4) setMerdekaFase('fase_b');
      else if (gradeLevel <= 6) setMerdekaFase('fase_c');
      else if (gradeLevel <= 9) setMerdekaFase('fase_d');
      else if (gradeLevel === 10) setMerdekaFase('fase_e');
      else setMerdekaFase('fase_f');
    }
  }, [gradeLevel]);

  // Dynamic topics based on selected curriculum, grade, semester, and period
  const suggestedTopics = getCurriculumTopicsV2(curriculum, gradeLevel, semester, examPeriod);

  // Handlers for switching grade, semester, and period with auto-updating topics
  const handleGradeChange = (g: GradeLevel) => {
    setGradeLevel(g);
    const newTopics = getCurriculumTopicsV2(curriculum, g, semester, examPeriod);
    if (newTopics.length > 0 && topicSource === 'curriculum') {
      setBookName(newTopics[0].topic);
    }
  };

  const handleSemesterChange = (s: Semester) => {
    setSemester(s);
    const newTopics = getCurriculumTopicsV2(curriculum, gradeLevel, s, examPeriod);
    if (newTopics.length > 0 && topicSource === 'curriculum') {
      setBookName(newTopics[0].topic);
    }
  };

  const handlePeriodChange = (p: ExamPeriod) => {
    setExamPeriod(p);
    const newTopics = getCurriculumTopicsV2(curriculum, gradeLevel, semester, p);
    if (newTopics.length > 0 && topicSource === 'curriculum') {
      setBookName(newTopics[0].topic);
    }
  };

  // Timer ticker during loading
  useEffect(() => {
    let interval: any = null;
    if (loading) {
      setLoadingSeconds(0);
      interval = setInterval(() => {
        setLoadingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setLoadingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    setGenerationError(null);

    if (topicSource === 'kisikisi' && !kisiKisiFile) {
      const msg = 'Silakan upload atau drag & drop foto/dokumen PDF lembar kisi-kisi dari guru Anda terlebih dahulu.';
      setGenerationError(msg);
      showAlert('File Kisi-Kisi Belum Ada', msg);
      return;
    }

    if (!bookName.trim()) {
      const msg = 'Silakan masukkan topik materi atau judul sesi ujian terlebih dahulu.';
      setGenerationError(msg);
      showAlert('Perhatian', msg);
      return;
    }

    const qCount = parseInt(questionCount) || 5;
    if (qCount > 20) {
      const msg = 'Maksimal butir soal per pembuatan adalah 20 butir soal.';
      setGenerationError(msg);
      showAlert('Batas Butir Soal', msg);
      return;
    }

    // 1. Cek Kuota Harian
    const quotaCheck = await QuotaService.canGenerate(qCount, currentUser?.uid || 'guest');
    if (!quotaCheck.allowed) {
      const reasonText = quotaCheck.reason || 'Batas kuota pembuatan soal harian Anda telah tercapai.';
      setGenerationError(reasonText);
      showAlert('Batas Kuota Harian', reasonText, [
        { text: 'Nanti', style: 'cancel' },
        { text: 'Tingkatkan Kuota (Rp 5.000) ⚡', onPress: () => setUpgradeModalVisible(true) },
      ]);
      return;
    }

    try {
      setLoading(true);

      const setup: ExamSetup = {
        curriculum,
        language,
        gradeLevel,
        tier: getTier(gradeLevel),
        semester,
        examPeriod,
        bookName: topicSource === 'kisikisi'
          ? (bookName.trim() || `Kisi-Kisi: ${kisiKisiFile?.name}`)
          : bookName.trim(),
        numberOfQuestions: qCount,
        questionType: type,
        mode,
        curriculumParams: {
          merdeka: curriculum === 'merdeka' ? { fase: merdekaFase } : undefined,
          cambridge: curriculum === 'cambridge' ? { paperType: cambridgePaper } : undefined,
          singapore: curriculum === 'singapore' ? { problemSolvingMethod: singaporeMethod } : undefined,
          ib: curriculum === 'ib' ? { programme: ibProgramme } : undefined,
          american: curriculum === 'american' ? { standardFramework: americanStandard } : undefined,
        },
        isKisiKisiMode: topicSource === 'kisikisi',
        kisiKisiMode: topicSource === 'kisikisi' ? kisiKisiMode : undefined,
        kisiKisiFileName: topicSource === 'kisikisi' ? kisiKisiFile?.name : undefined,
        createdAt: new Date(),
      };

      const activeKey = activeKeyInfo || (await AIService.getActiveKey());

      const aiResponse = await AIService.generateQuestions({
        ...setup,
        curriculum,
        language,
        tier: getTier(gradeLevel),
        curriculumParams: setup.curriculumParams,
        aiConfig: {
          provider: activeKey.provider,
          apiKey: activeKey.apiKey,
          baseUrl: activeKey.baseUrl,
          model: activeKey.model,
        },
        isKisiKisiMode: topicSource === 'kisikisi',
        kisiKisiMode: topicSource === 'kisikisi' ? kisiKisiMode : undefined,
        kisiKisiAttachment: topicSource === 'kisikisi' && kisiKisiFile ? kisiKisiFile : undefined,
        kisiKisiNotes: topicSource === 'kisikisi' ? kisiKisiNotes.trim() : undefined,
      });

      // Catat penggunaan kuota
      await QuotaService.recordGeneration(aiResponse.questions.length, currentUser?.uid || 'guest');
      loadQuota();

      let setupId = 'temp_id';
      if (currentUser?.uid) {
        setupId = await firestoreService.saveExamSetup(currentUser.uid, setup);
      }

      navigation.navigate('Question', {
        examSetupId: setupId,
        setup: setup,
        questions: aiResponse.questions,
        questionIndex: 0,
      });
    } catch (e: any) {
      const errorText = `${e?.message || ''} ${e?.details || ''}`.toLowerCase();
      const isRateLimited =
        e?.status === 429 ||
        e?.code === 'RATE_LIMIT' ||
        errorText.includes('429') ||
        errorText.includes('rate limit') ||
        errorText.includes('quota') ||
        errorText.includes('resource_exhausted');

      const userErrMsg = isRateLimited
        ? 'Server AI sedang antre atau kuota sementara habis. Silakan coba 1 menit lagi atau periksa konfigurasi API Key di Pengaturan.'
        : (e?.message || 'Terjadi kesalahan saat memproses pertanyaan dari AI.');

      setGenerationError(userErrMsg);

      if (isRateLimited) {
        showAlert(
          'Server AI Sedang Sibuk',
          userErrMsg,
          [
            { text: 'Tutup', style: 'cancel' },
            { text: 'Buka Pengaturan AI', onPress: () => navigation?.navigate('Settings') },
          ]
        );
      } else {
        showAlert('Gagal Membuat Soal', userErrMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSubscription = async () => {
    try {
      setUpgrading(true);
      await QuotaService.activateSubscription(currentUser?.uid || 'guest', 'Paket Pelajar 3x Kuota (Rp 5.000/bln)');
      await loadQuota();
      setUpgradeModalVisible(false);
      Alert.alert(
        'Langganan Berhasil Aktif! 🎉',
        'Selamat! Kuota Anda telah ditingkatkan menjadi 3x lipat (15 kali buat soal / 300 butir soal per hari) aktif selama 30 hari.'
      );
    } catch (e: any) {
      Alert.alert('Gagal Mengaktifkan', e?.message || 'Terjadi kesalahan saat proses pembayaran.');
    } finally {
      setUpgrading(false);
    }
  };

  const periodLabel = examPeriod === 'pts' ? 'Tengah Semester (PTS)' : examPeriod === 'pas' ? 'Akhir Semester (PAS)' : 'Materi Reguler';

  const remainingGenerates = userQuota ? Math.max(0, userQuota.maxGeneratesPerDay - userQuota.generatesUsedToday) : 5;
  const remainingQuestions = userQuota ? Math.max(0, userQuota.maxQuestionsPerDay - userQuota.questionsGeneratedToday) : 100;

  const activeDiscount = Math.max(userDiscountPercent, appliedCoupon?.percent || 0);
  const originalPrice = 5000;
  const finalPrice = Math.max(0, originalPrice - Math.round(originalPrice * (activeDiscount / 100)));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.mainWrapper, isDesktop && styles.desktopMainWrapper]}>
        {/* Left Column: Form Setup */}
        <View style={[styles.formColumn, isDesktop && styles.desktopFormColumn]}>
          <View style={styles.header}>
            <View style={styles.brandHeroCard}>
              <Image
                source={require('../../assets/edunesis-logo.jpg')}
                style={styles.setupLogoImg}
                resizeMode="contain"
              />
              <View style={styles.setupMascotTag}>
                <Image
                  source={require('../../assets/edunesis-mascot-kibo.png')}
                  style={styles.setupMascotImg}
                  resizeMode="contain"
                />
                <View style={styles.setupMascotTextBox}>
                  <Text style={styles.setupMascotTitle}>Hai, Sahabat Belajar! 🤖</Text>
                  <Text style={styles.setupMascotSub}>Didampingi Kibo · AI Try Out</Text>
                </View>
              </View>
            </View>
            <Text style={styles.badge}>KONFIGURASI UJIAN AI</Text>
            <Text style={styles.title}>Mulai Latihan Baru</Text>
            <Text style={styles.sub}>
              Pilih mode latihan, tingkat kelas, semester, dan evaluasi. Topik materi otomatis menyesuaikan standar {getCurriculumShortName(curriculum)}.
            </Text>
          </View>

          {/* Kuota & Subscription Pill Banner */}
          <View style={[styles.quotaBanner, userQuota?.isSubscribed && styles.quotaBannerPremium]}>
            <View style={styles.quotaLeft}>
              <Text style={styles.quotaIcon}>{userQuota?.isSubscribed ? '⭐' : '📊'}</Text>
              <View>
                <Text style={styles.quotaTitle}>
                  {userQuota?.isSubscribed ? 'Paket Pelajar 3x Kuota (Aktif)' : 'Kuota Gratis Harian'}
                </Text>
                <Text style={styles.quotaSub}>
                  Sisa: <Text style={{ fontWeight: '800', color: '#2563eb' }}>{remainingGenerates} kali</Text> buat soal ({remainingQuestions} butir soal hari ini)
                </Text>
              </View>
            </View>
            {!userQuota?.isSubscribed ? (
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => setUpgradeModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.upgradeBtnText}>⚡ Upgrade (Rp 5rb/bln)</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* AI Banner Status */}
          <View style={styles.aiBanner}>
            <View style={styles.aiBannerLeft}>
              <View style={styles.aiDot} />
              <View>
                <Text style={styles.aiBannerTitle}>
                  {isUsingSystemKey
                    ? 'Edunesis AI Bawaan (Gratis)'
                    : `API Key Kustom (${activeKeyInfo?.provider?.toUpperCase()})`}
                </Text>
                <Text style={styles.aiBannerSub}>AI aktif dan siap menghasilkan soal berkualitas tinggi.</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation?.navigate('Settings')} activeOpacity={0.7}>
              <Text style={styles.settingsLink}>Pengaturan AI ⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Mode Latihan vs Tryout Selector */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.label}>Pilih Mode Belajar</Text>
              <Text style={styles.selectionIndicator}>
                {mode === 'training' ? '💡 Feedback Langsung' : '⏱️ Simulasi Try Out'}
              </Text>
            </View>
            <View style={styles.modeCardsRow}>
              <TouchableOpacity
                style={[styles.modeCard, mode === 'training' && styles.modeCardActive]}
                onPress={() => setMode('training')}
                activeOpacity={0.7}
              >
                <Text style={styles.modeCardIcon}>💡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modeCardTitle, mode === 'training' && styles.modeCardTitleActive]}>
                    Mode Latihan (Training)
                  </Text>
                  <Text style={styles.modeCardDesc}>
                    Klik jawaban langsung muncul pembahasan benar/salah saat itu juga. Di akhir ada analisis kekurangan.
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeCard, mode === 'tryout' && styles.modeCardActive]}
                onPress={() => setMode('tryout')}
                activeOpacity={0.7}
              >
                <Text style={styles.modeCardIcon}>⏱️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modeCardTitle, mode === 'tryout' && styles.modeCardTitleActive]}>
                    Mode Try Out Resmi
                  </Text>
                  <Text style={styles.modeCardDesc}>
                    Simulasi ujian tanpa distraksi. Pembahasan dan skor lengkap ditampilkan di akhir ujian.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Curriculum Selection (1 Row Yang Bisa Digeser ke Kanan) */}
            <View style={styles.sectionHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.label}>Pilih Kurikulum Acuan</Text>
                <Text style={styles.selectionIndicator}>
                  {curriculum === 'merdeka' ? '🇮🇩 Kurikulum Merdeka' :
                   curriculum === 'k13' ? '🇮🇩 Kurikulum 2013' :
                   curriculum === 'cambridge' ? '🇬🇧 Cambridge (CAIE)' :
                   curriculum === 'ib' ? '🌐 IB (PYP/MYP/DP)' :
                   curriculum === 'singapore' ? '🇸🇬 Singapore MOE' :
                   curriculum === 'edexcel' ? '🇬🇧 Pearson Edexcel' :
                   curriculum === 'american' ? '🇺🇸 American (AP/NGSS)' : '🧸 IPC & Montessori'}
                </Text>
              </View>
              <View style={styles.scrollNavControls}>
                <TouchableOpacity
                  style={styles.scrollNavBtn}
                  onPress={() => scrollCurriculum('left')}
                  activeOpacity={0.7}
                  accessibilityLabel="Geser kurikulum ke kiri"
                >
                  <Text style={styles.scrollNavBtnText}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.scrollNavBtn}
                  onPress={() => scrollCurriculum('right')}
                  activeOpacity={0.7}
                  accessibilityLabel="Geser kurikulum ke kanan"
                >
                  <Text style={styles.scrollNavBtnText}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              ref={curriculumScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              directionalLockEnabled={true}
              scrollEventThrottle={16}
              alwaysBounceHorizontal={true}
              style={styles.singleRowScroll}
              contentContainerStyle={styles.singleRowContent}
            >
              {ALL_CURRICULA.map((c) => {
                const isSelected = curriculum === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.curriculumSingleCard, isSelected && styles.curriculumSingleCardActive]}
                    onPress={() => handleCurriculumChange(c.id as CurriculumType)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.curriculumCardHeader}>
                      <Text style={styles.curriculumFlag}>{c.flag}</Text>
                      {isSelected ? (
                        <View style={styles.curriculumCheckBadge}>
                          <Text style={styles.curriculumCheckText}>✓ Aktif</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={[styles.curriculumCardTitle, isSelected && styles.curriculumCardTitleActive]}
                      numberOfLines={1}
                    >
                      {c.title}
                    </Text>
                    <Text
                      style={[styles.curriculumCardSub, isSelected && styles.curriculumCardSubActive]}
                      numberOfLines={1}
                    >
                      {c.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Language Selection */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.label}>Bahasa Pengantar Soal</Text>
              <Text style={styles.selectionIndicator}>
                {language === 'id' ? '🇮🇩 Bahasa Indonesia' : language === 'en' ? '🇬🇧 English' : '🌐 Bilingual (ID + EN)'}
              </Text>
            </View>
            <View style={styles.langRow}>
              {[
                { id: 'id', label: '🇮🇩 Indonesia' },
                { id: 'en', label: '🇬🇧 English' },
                { id: 'bilingual', label: '🌐 Bilingual (ID+EN)' },
              ].map((l) => (
                <TouchableOpacity
                  key={l.id}
                  style={[styles.langBtn, language === l.id && styles.langBtnActive]}
                  onPress={() => setLanguage(l.id as AssessmentLanguage)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langBtnText, language === l.id && styles.langBtnTextActive]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Conditional Curriculum Tuning Box */}
            {curriculum === 'merdeka' && (
              <View style={styles.customParamsBox}>
                <Text style={styles.paramBoxTitle}>⚡ Penyelarasan Kurikulum Merdeka (Deep Learning):</Text>
                <Text style={styles.paramBoxSub}>
                  Fase aktif: <Text style={{ fontWeight: '800', color: '#2563eb' }}>{merdekaFase.toUpperCase()}</Text> • Pendekatan: Mindful, Meaningful & Joyful Learning.
                </Text>
              </View>
            )}

            {curriculum === 'cambridge' && (
              <View style={styles.customParamsBox}>
                <Text style={styles.paramBoxTitle}>🏛️ Format Paper Cambridge International:</Text>
                <View style={styles.pillRow}>
                  {[
                    { id: 'paper_1_mcq', label: 'Paper 1 (MCQ)' },
                    { id: 'paper_2_theory', label: 'Paper 2 (Structured)' },
                    { id: 'extended', label: 'Extended Paper' },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.paramPill, cambridgePaper === p.id && styles.paramPillActive]}
                      onPress={() => setCambridgePaper(p.id as any)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.paramPillText, cambridgePaper === p.id && styles.paramPillTextActive]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {curriculum === 'singapore' && (
              <View style={styles.customParamsBox}>
                <Text style={styles.paramBoxTitle}>🇸🇬 Metode Pemecahan Masalah Singapore MOE:</Text>
                <View style={styles.pillRow}>
                  {[
                    { id: 'bar_modeling', label: 'Model Batang (Bar Modeling)' },
                    { id: 'heuristics', label: 'Metode Heuristik (Problem Sums)' },
                  ].map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.paramPill, singaporeMethod === m.id && styles.paramPillActive]}
                      onPress={() => setSingaporeMethod(m.id as any)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.paramPillText, singaporeMethod === m.id && styles.paramPillTextActive]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {curriculum === 'ib' && (
              <View style={styles.customParamsBox}>
                <Text style={styles.paramBoxTitle}>🌐 Program International Baccalaureate (IB):</Text>
                <View style={styles.pillRow}>
                  {[
                    { id: 'pyp', label: 'Primary Years (PYP)' },
                    { id: 'myp', label: 'Middle Years (MYP)' },
                    { id: 'dp', label: 'Diploma Programme (DP)' },
                  ].map((ib) => (
                    <TouchableOpacity
                      key={ib.id}
                      style={[styles.paramPill, ibProgramme === ib.id && styles.paramPillActive]}
                      onPress={() => setIbProgramme(ib.id as any)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.paramPillText, ibProgramme === ib.id && styles.paramPillTextActive]}>
                        {ib.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {curriculum === 'american' && (
              <View style={styles.customParamsBox}>
                <Text style={styles.paramBoxTitle}>🇺🇸 Standar Kurikulum Amerika Serikat:</Text>
                <View style={styles.pillRow}>
                  {[
                    { id: 'common_core', label: 'Common Core (CCSS)' },
                    { id: 'ngss', label: 'Next Gen Science (NGSS)' },
                    { id: 'ap', label: 'Advanced Placement (AP Track)' },
                  ].map((am) => (
                    <TouchableOpacity
                      key={am.id}
                      style={[styles.paramPill, americanStandard === am.id && styles.paramPillActive]}
                      onPress={() => setAmericanStandard(am.id as any)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.paramPillText, americanStandard === am.id && styles.paramPillTextActive]}>
                        {am.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Grade Level Selection (1 Row SD sampai SMA & PAUD Yang Bisa Digeser ke Kanan) */}
            <View style={styles.sectionHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.label}>Tingkat Kelas & Jenjang</Text>
                <Text style={styles.selectionIndicator}>Terpilih: {getGradeDisplay(gradeLevel)}</Text>
              </View>
              <View style={styles.scrollNavControls}>
                <TouchableOpacity
                  style={styles.scrollNavBtn}
                  onPress={() => scrollGrades('left')}
                  activeOpacity={0.7}
                  accessibilityLabel="Geser jenjang ke kiri"
                >
                  <Text style={styles.scrollNavBtnText}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.scrollNavBtn}
                  onPress={() => scrollGrades('right')}
                  activeOpacity={0.7}
                  accessibilityLabel="Geser jenjang ke kanan"
                >
                  <Text style={styles.scrollNavBtnText}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              ref={gradeScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              directionalLockEnabled={true}
              scrollEventThrottle={16}
              alwaysBounceHorizontal={true}
              style={styles.singleRowScroll}
              contentContainerStyle={styles.singleRowContent}
            >
              {ALL_GRADES.map((item) => {
                const isSelected = gradeLevel === item.id;
                return (
                  <TouchableOpacity
                    key={String(item.id)}
                    style={[styles.gradeSingleCard, isSelected && styles.gradeSingleCardActive]}
                    onPress={() => handleGradeChange(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.gradeCardHeader}>
                      <View style={[styles.gradeTierPill, isSelected && styles.gradeTierPillActive]}>
                        <Text style={[styles.gradeTierPillText, isSelected && styles.gradeTierPillTextActive]}>
                          {item.tier}
                        </Text>
                      </View>
                      {isSelected ? <Text style={styles.gradeCheckIcon}>✓</Text> : null}
                    </View>

                    <Text style={[styles.gradeMainTitle, isSelected && styles.gradeMainTitleActive]}>
                      {item.icon ? `${item.icon} ${item.badge}` : item.badge}
                    </Text>

                    <Text style={[styles.gradeSubLabel, isSelected && styles.gradeSubLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Semester Selection */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.label}>Semester</Text>
              <Text style={styles.selectionIndicator}>Semester {semester === 'I' ? '1 (Ganjil)' : '2 (Genap)'}</Text>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.choiceBtn, { flex: 1 }, semester === 'I' && styles.choiceBtnActive]}
                onPress={() => handleSemesterChange('I')}
                activeOpacity={0.7}
              >
                <Text style={[styles.choiceText, semester === 'I' && styles.choiceTextActive]}>🌱 Semester 1 (Ganjil)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceBtn, { flex: 1 }, semester === 'II' && styles.choiceBtnActive]}
                onPress={() => handleSemesterChange('II')}
                activeOpacity={0.7}
              >
                <Text style={[styles.choiceText, semester === 'II' && styles.choiceTextActive]}>🌿 Semester 2 (Genap)</Text>
              </TouchableOpacity>
            </View>

            {/* Exam Period / Evaluation Focus */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.label}>Target Periode Ujian</Text>
              <Text style={styles.selectionIndicator}>{periodLabel}</Text>
            </View>
            <View style={styles.periodRow}>
              <TouchableOpacity
                style={[styles.periodBtn, examPeriod === 'regular' && styles.periodBtnActive]}
                onPress={() => handlePeriodChange('regular')}
                activeOpacity={0.7}
              >
                <Text style={[styles.periodBtnText, examPeriod === 'regular' && styles.periodBtnTextActive]}>
                  📖 Bab Reguler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodBtn, examPeriod === 'pts' && styles.periodBtnActive]}
                onPress={() => handlePeriodChange('pts')}
                activeOpacity={0.7}
              >
                <Text style={[styles.periodBtnText, examPeriod === 'pts' && styles.periodBtnTextActive]}>
                  📝 Tengah Semester (PTS)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodBtn, examPeriod === 'pas' && styles.periodBtnActive]}
                onPress={() => handlePeriodChange('pas')}
                activeOpacity={0.7}
              >
                <Text style={[styles.periodBtnText, examPeriod === 'pas' && styles.periodBtnTextActive]}>
                  🎯 Akhir Semester (PAS)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sumber Materi: Standar Kurikulum vs Kisi-Kisi Guru */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.label}>Pilih Sumber Materi Ujian</Text>
              <Text style={styles.selectionIndicator}>
                {topicSource === 'curriculum' ? `📚 ${getCurriculumShortName(curriculum)}` : '📄 Kisi-Kisi Guru (AI Vision)'}
              </Text>
            </View>

            <View style={styles.sourceSelectorRow}>
              <TouchableOpacity
                style={[styles.sourceBtn, topicSource === 'curriculum' && styles.sourceBtnActive]}
                onPress={() => setTopicSource('curriculum')}
                activeOpacity={0.7}
              >
                <Text style={styles.sourceBtnIcon}>📚</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sourceBtnTitle, topicSource === 'curriculum' && styles.sourceBtnTitleActive]}>
                    Materi {getCurriculumShortName(curriculum)}
                  </Text>
                  <Text style={styles.sourceBtnSub}>{getCurriculumSourceDesc(curriculum)}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sourceBtn, topicSource === 'kisikisi' && styles.sourceBtnActive]}
                onPress={() => setTopicSource('kisikisi')}
                activeOpacity={0.7}
              >
                <Text style={styles.sourceBtnIcon}>📄</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.sourceBtnTitle, topicSource === 'kisikisi' && styles.sourceBtnTitleActive]}>
                      Upload Kisi-Kisi Guru
                    </Text>
                    <View style={styles.hotBadge}>
                      <Text style={styles.hotBadgeText}>AI Vision</Text>
                    </View>
                  </View>
                  <Text style={styles.sourceBtnSub}>AI membaca foto / PDF lembar kisi-kisi</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* JIKA SUMBER: KURIKULUM */}
            {topicSource === 'curriculum' ? (
              <View style={{ marginTop: 14 }}>
                <Text style={styles.label}>Topik Materi / Silabus Pembelajaran</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Contoh: ${suggestedTopics[0]?.topic || 'Matematika'}`}
                  placeholderTextColor="#94a3b8"
                  value={bookName}
                  onChangeText={setBookName}
                />

                {/* Dynamic Quick Topic Chips */}
                <View style={styles.chipHeaderContainer}>
                  <Text style={styles.chipHeader}>
                    💡 Rekomendasi Topik {getCurriculumShortName(curriculum)} ({getGradeDisplay(gradeLevel)} - Smt {semester === 'I' ? '1' : '2'} {examPeriod === 'pts' ? 'PTS' : examPeriod === 'pas' ? 'PAS' : ''}):
                  </Text>
                  <Text style={styles.chipSub}>Klik untuk langsung memilih topik resmi kurikulum ini</Text>
                </View>
                <View style={styles.chipGrid}>
                  {suggestedTopics.map((item, i) => {
                    const isSelected = bookName === item.topic;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => setBookName(item.topic)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.chipIcon}>{item.icon}</Text>
                        <View style={styles.chipContent}>
                          <Text style={[styles.chipSubject, isSelected && styles.chipSubjectActive]}>{item.subject}</Text>
                          <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{item.topic}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              /* JIKA SUMBER: UPLOAD KISI-KISI GURU */
              <View style={styles.kisiKisiContainer}>
                {/* 1. Upload Box with Drag and Drop Support */}
                {!kisiKisiFile ? (
                  <TouchableOpacity
                    ref={dropzoneRef as any}
                    style={[
                      styles.uploadDropzone,
                      isDraggingOver && styles.uploadDropzoneActive,
                    ]}
                    onPress={handlePickKisiKisiFile}
                    disabled={isPickingFile}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.uploadIconCircle, isDraggingOver && styles.uploadIconCircleActive]}>
                      <Text style={{ fontSize: 28 }}>{isDraggingOver ? '📥' : '📎'}</Text>
                    </View>
                    <Text style={[styles.uploadTitle, isDraggingOver && styles.uploadTitleActive]}>
                      {isPickingFile
                        ? 'Membaca File Dokumen...'
                        : isDraggingOver
                        ? 'Lepaskan File Kisi-Kisi di Sini ✨'
                        : 'Upload atau Drag & Drop Kisi-Kisi Guru'}
                    </Text>
                    <Text style={[styles.uploadSub, isDraggingOver && styles.uploadSubActive]}>
                      {isDraggingOver
                        ? 'Lepaskan mouse untuk langsung memproses kisi-kisi dengan AI Edunesis'
                        : 'Tarik & lepas file langsung ke sini, atau klik tombol di bawah untuk memilih file (JPG, PNG, WEBP, atau Dokumen PDF maks. 10MB)'}
                    </Text>
                    <View style={[styles.uploadActionBtn, isDraggingOver && styles.uploadActionBtnActive]}>
                      <Text style={styles.uploadActionBtnText}>
                        {isDraggingOver ? '📥 Lepaskan File Sekarang' : '📁 Pilih Foto / File PDF Kisi-Kisi'}
                      </Text>
                    </View>

                    {/* Drag & Drop Visual Hint Pill */}
                    <View style={styles.dragPillHint}>
                      <Text style={styles.dragPillHintText}>💡 Mendukung Drag & Drop dari Laptop / Komputer</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View
                    ref={dropzoneRef as any}
                    style={[
                      styles.uploadedFileCard,
                      isDraggingOver && styles.uploadedFileCardDragging,
                    ]}
                  >
                    <View style={styles.uploadedFileHeader}>
                      <View style={styles.fileIconBox}>
                        <Text style={{ fontSize: 24 }}>
                          {kisiKisiFile.mimeType.includes('pdf') ? '📕' : '🖼️'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <Text style={styles.fileNameText} numberOfLines={1}>
                            {kisiKisiFile.name}
                          </Text>
                          <View style={styles.fileReadyBadge}>
                            <Text style={styles.fileReadyBadgeText}>Siap Dibaca AI ✅</Text>
                          </View>
                        </View>
                        <Text style={styles.fileMetaText}>
                          Ukuran: {FilePickerService.formatFileSize(kisiKisiFile.sizeBytes)} • Tipe: {kisiKisiFile.mimeType.toUpperCase()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.changeFileBtn}
                        onPress={handlePickKisiKisiFile}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.changeFileBtnText}>Ganti File 🔄</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Image Preview thumbnail if image */}
                    {!kisiKisiFile.mimeType.includes('pdf') && kisiKisiFile.uri ? (
                      <View style={styles.thumbnailBox}>
                        <Image
                          source={{ uri: kisiKisiFile.uri }}
                          style={styles.imageThumbnail}
                          resizeMode="contain"
                        />
                        <Text style={styles.thumbnailHint}>🔍 Dokumen Foto Kisi-Kisi Guru Terlampir</Text>
                      </View>
                    ) : null}

                    {/* Drag Over Hint to Replace File */}
                    {isDraggingOver && (
                      <View style={styles.dragReplaceOverlay}>
                        <Text style={styles.dragReplaceText}>📥 Lepaskan file untuk mengganti dokumen kisi-kisi</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* 2. Pilihan Mode Pembuatan Soal dari Kisi-Kisi */}
                <View style={styles.kisiModeSection}>
                  <Text style={styles.label}>Pilih Model Pembuatan Soal AI:</Text>
                  <Text style={styles.kisiModeSectionHint}>
                    Tentukan apakah soal dibuat persis menguji butir kisi-kisi atau model soal variatif.
                  </Text>

                  <View style={styles.kisiModeRow}>
                    {/* Option 1: EXACT */}
                    <TouchableOpacity
                      style={[styles.kisiModeCard, kisiKisiMode === 'exact' && styles.kisiModeCardActive]}
                      onPress={() => setKisiKisiMode('exact')}
                      activeOpacity={0.8}
                    >
                      <View style={styles.kisiModeHeader}>
                        <View style={styles.kisiModeRadio}>
                          {kisiKisiMode === 'exact' ? <View style={styles.kisiModeRadioInner} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.kisiModeTitle, kisiKisiMode === 'exact' && styles.kisiModeTitleActive]}>
                              🎯 Exact Sesuai Kisi-Kisi
                            </Text>
                            <View style={styles.kisiExactTag}>
                              <Text style={styles.kisiExactTagText}>Persis Indikator</Text>
                            </View>
                          </View>
                          <Text style={styles.kisiModeDesc}>
                            AI membuat pertanyaan yang <Text style={{ fontWeight: '700' }}>persis menguji butir indikator materi</Text> dan kompetensi kisi-kisi guru tanpa melenceng.
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Option 2: SIMILAR */}
                    <TouchableOpacity
                      style={[styles.kisiModeCard, kisiKisiMode === 'similar' && styles.kisiModeCardActive]}
                      onPress={() => setKisiKisiMode('similar')}
                      activeOpacity={0.8}
                    >
                      <View style={styles.kisiModeHeader}>
                        <View style={styles.kisiModeRadio}>
                          {kisiKisiMode === 'similar' ? <View style={styles.kisiModeRadioInner} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.kisiModeTitle, kisiKisiMode === 'similar' && styles.kisiModeTitleActive]}>
                              🔄 Model Soal Mirip Kisi-Kisi
                            </Text>
                            <View style={styles.kisiSimilarTag}>
                              <Text style={styles.kisiSimilarTagText}>Variasi & Latihan</Text>
                            </View>
                          </View>
                          <Text style={styles.kisiModeDesc}>
                            AI menyusun <Text style={{ fontWeight: '700' }}>contoh soal variasi baru</Text> yang model, pola, dan tipe penalarannya serupa dengan kisi-kisi, dengan angka atau studi kasus yang berbeda.
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3. Catatan Tambahan Opsional */}
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.label}>Catatan Tambahan untuk AI (Opsional):</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Fokus ke indikator nomor 1-5, atau perbanyak soal cerita..."
                    placeholderTextColor="#94a3b8"
                    value={kisiKisiNotes}
                    onChangeText={setKisiKisiNotes}
                  />
                </View>

                {/* 4. Label Topik / Buku Ujian */}
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>Judul / Keterangan Sesi Ujian:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Kisi-Kisi Ujian Matematika PTS Kelas 4"
                    placeholderTextColor="#94a3b8"
                    value={bookName}
                    onChangeText={setBookName}
                  />
                </View>
              </View>
            )}

            {/* Question Count */}
            <View style={styles.splitRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Jumlah Butir Soal (Maksimal 20 per sesi)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor="#94a3b8"
                  value={questionCount}
                  onChangeText={(val) => {
                    const num = parseInt(val) || 0;
                    if (num > 20) setQuestionCount('20');
                    else setQuestionCount(val);
                  }}
                />
                <Text style={styles.inputHint}>*Maksimal 20 soal per sekali buat, total hingga 100 soal/hari.</Text>
              </View>
            </View>

            {/* Inline Error Banner jika terjadi kendala */}
            {generationError && (
              <View style={styles.errorAlertCard}>
                <View style={styles.errorAlertHeader}>
                  <Text style={styles.errorAlertIcon}>⚠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.errorAlertTitle}>Kendala Pembuatan Soal AI</Text>
                    <Text style={styles.errorAlertText}>{generationError}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setGenerationError(null)} style={styles.errorDismissBtn}>
                    <Text style={styles.errorDismissText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.btn, (loading || isKeyLoading) && styles.btnDisabled]}
              onPress={handleGenerate}
              disabled={loading || isKeyLoading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.btnText}>Menghubungi AI ({loadingSeconds}s)...</Text>
                </View>
              ) : (
                <Text style={styles.btnText}>✨ Mulai Buat Soal AI</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Column: Desktop Helper & Preview */}
        {isDesktop ? (
          <View style={styles.desktopHelperColumn}>
            <View style={styles.helperCard}>
              <Text style={styles.helperTitle}>🤖 AI Companion Edunesis</Text>
              <Text style={styles.helperText}>
                Sistem AI kami otomatis mereferensikan standar silabus {getCurriculumShortName(curriculum)} untuk jenjang {getGradeDisplay(gradeLevel)}.
              </Text>

              <View style={styles.contextSummaryBox}>
                <Text style={styles.contextSummaryTitle}>Konfigurasi Aktif:</Text>
                <Text style={styles.contextSummaryItem}>• Kurikulum: <Text style={{ fontWeight: '700', color: '#2563eb' }}>{getCurriculumShortName(curriculum)}</Text></Text>
                <Text style={styles.contextSummaryItem}>• Bahasa: <Text style={{ fontWeight: '700', color: '#10b981' }}>{language === 'id' ? 'Bahasa Indonesia' : language === 'en' ? 'English' : 'Bilingual (ID & EN)'}</Text></Text>
                <Text style={styles.contextSummaryItem}>• Mode: <Text style={{ fontWeight: '700', color: '#2563eb' }}>{mode === 'training' ? 'Latihan (Instant Feedback)' : 'Try Out Resmi'}</Text></Text>
                <Text style={styles.contextSummaryItem}>• Tingkat: <Text style={{ fontWeight: '700' }}>{getGradeDisplay(gradeLevel)}</Text></Text>
                <Text style={styles.contextSummaryItem}>• Semester: <Text style={{ fontWeight: '700' }}>{semester === 'I' ? '1 (Ganjil)' : '2 (Genap)'}</Text></Text>
                <Text style={styles.contextSummaryItem}>• Periode: <Text style={{ fontWeight: '700' }}>{periodLabel}</Text></Text>
                <Text style={styles.contextSummaryItem}>• Sumber: <Text style={{ fontWeight: '700', color: '#2563eb' }}>{topicSource === 'curriculum' ? `Silabus ${getCurriculumShortName(curriculum)}` : `Kisi-Kisi Guru (${kisiKisiMode === 'exact' ? 'Exact' : 'Model Mirip'})`}</Text></Text>
                <Text style={styles.contextSummaryItem}>• Topik: <Text style={{ fontWeight: '700', color: '#2563eb' }}>"{bookName}"</Text></Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎯</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureHeader}>Pembahasan Instan di Mode Latihan</Text>
                  <Text style={styles.featureDesc}>Langsung tahu kenapa benar/salah saat memilih jawaban tanpa menunggu ujian selesai.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureHeader}>Diagnostik Analisis Kekurangan</Text>
                  <Text style={styles.featureDesc}>Rangkuman bagian materi yang belum dikuasai agar belajar lebih tepat sasaran.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureHeader}>Kuota Adil & Terjangkau</Text>
                  <Text style={styles.featureDesc}>5x gratis tiap hari. Mau 3x lipat kuota? Hanya Rp 5.000 / bulan.</Text>
                </View>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Rata-rata Waktu Generasi:</Text>
                <Text style={styles.statValue}>~3 - 6 Detik</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {/* Subscription / Upgrade Modal */}
      <Modal visible={upgradeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.subscriptionCard}>
            <View style={styles.subModalHeader}>
              <Text style={styles.subModalIcon}>⚡</Text>
              <Text style={styles.subModalTitle}>Tingkatkan Kuota Belajar</Text>
              <Text style={styles.subModalSubtitle}>
                Dapatkan kuota 3x lebih banyak untuk latihan dan simulasi ujian tanpa hambatan.
              </Text>
            </View>

            <View style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <Text style={styles.planName}>Paket Pelajar Juara</Text>
                <Text style={styles.planBadge}>Paling Populer 🔥</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.currency}>Rp</Text>
                {activeDiscount > 0 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 22, textDecorationLine: 'line-through', color: '#94a3b8', fontWeight: '700' }}>
                      5.000
                    </Text>
                    <Text style={[styles.priceAmount, { color: '#16a34a' }]}>
                      {finalPrice.toLocaleString('id-ID')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.priceAmount}>5.000</Text>
                )}
                <Text style={styles.pricePeriod}>/ bulan</Text>
              </View>

              {activeDiscount > 0 ? (
                <View style={styles.discountAlert}>
                  <Text style={styles.discountAlertText}>
                    🎉 Diskon {activeDiscount}% berhasil digunakan! Hemat Rp {(originalPrice - finalPrice).toLocaleString('id-ID')}
                  </Text>
                </View>
              ) : null}

              {/* Coupon Input Box */}
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponTextInput}
                  placeholder="Punya Kupon? (cth: DISKON50)"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="characters"
                  value={couponInput}
                  onChangeText={setCouponInput}
                />
                <TouchableOpacity style={styles.applyCouponBtn} onPress={handleApplyCoupon} activeOpacity={0.7}>
                  <Text style={styles.applyCouponBtnText}>Pakai</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.priceNote}>Hanya Rp 166 per hari untuk kuota 3x lipat!</Text>

              <View style={styles.planFeatures}>
                <View style={styles.planFeatureItem}>
                  <Text style={styles.planFeatureCheck}>✅</Text>
                  <Text style={styles.planFeatureText}>
                    <Text style={{ fontWeight: '800' }}>15x Create Soal / Hari</Text> (3x lipat kuota gratis)
                  </Text>
                </View>
                <View style={styles.planFeatureItem}>
                  <Text style={styles.planFeatureCheck}>✅</Text>
                  <Text style={styles.planFeatureText}>
                    Hingga <Text style={{ fontWeight: '800' }}>300 Butir Soal</Text> per hari
                  </Text>
                </View>
                <View style={styles.planFeatureItem}>
                  <Text style={styles.planFeatureCheck}>✅</Text>
                  <Text style={styles.planFeatureText}>Mode Latihan + Pembahasan Instan tanpa batas</Text>
                </View>
                <View style={styles.planFeatureItem}>
                  <Text style={styles.planFeatureCheck}>✅</Text>
                  <Text style={styles.planFeatureText}>Akses seluruh Bank Materi Kelas 1 s.d. 6 SD & PTS/PAS</Text>
                </View>
                <View style={styles.planFeatureItem}>
                  <Text style={styles.planFeatureCheck}>💳</Text>
                  <Text style={styles.planFeatureText}>Mendukung QRIS, GoPay, OVO, ShopeePay & Virtual Account</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.checkoutBtn, upgrading && { opacity: 0.7 }]}
              onPress={handleSimulateSubscription}
              disabled={upgrading}
              activeOpacity={0.8}
            >
              {upgrading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.checkoutBtnText}>
                  Aktifkan Langganan (Rp {finalPrice.toLocaleString('id-ID')}) ➔
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setUpgradeModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeModalBtnText}>Nanti Saja</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modern Generation Loading Modal Overlay */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#2563eb" style={{ marginBottom: 16 }} />
            <Text style={styles.loadingTitle}>Sedang Merumuskan Soal AI...</Text>
            <Text style={styles.loadingSubtitle}>
              Materi: <Text style={styles.boldText}>"{bookName}"</Text> ({getGradeDisplay(gradeLevel)} - {semester === 'I' ? 'Smt 1' : 'Smt 2'} {periodLabel})
            </Text>

            <View style={styles.stepsContainer}>
              <View style={styles.stepRow}>
                <Text style={styles.stepIcon}>{loadingSeconds < 2 ? '⏳' : '✅'}</Text>
                <Text style={[styles.stepText, loadingSeconds >= 2 && styles.stepDone]}>
                  {topicSource === 'kisikisi'
                    ? `Membaca & menganalisis file kisi-kisi guru (${kisiKisiFile?.name || 'dokumen'})...`
                    : 'Menghubungi Edunesis AI...'}
                </Text>
              </View>

              <View style={styles.stepRow}>
                <Text style={styles.stepIcon}>{loadingSeconds < 4 ? '⏳' : '✅'}</Text>
                <Text style={[styles.stepText, loadingSeconds >= 4 && styles.stepDone]}>
                  {topicSource === 'kisikisi'
                    ? (kisiKisiMode === 'exact'
                        ? `Merumuskan ${questionCount} butir soal persis sesuai indikator kisi-kisi...`
                        : `Menyusun ${questionCount} butir soal variasi model serupa kisi-kisi...`)
                    : `Menyusun ${questionCount} butir soal ${periodLabel}...`}
                </Text>
              </View>

              <View style={styles.stepRow}>
                <Text style={styles.stepIcon}>{loadingSeconds < 6 ? '⏳' : '✅'}</Text>
                <Text style={[styles.stepText, loadingSeconds >= 6 && styles.stepDone]}>
                  Memvalidasi kunci jawaban & pembahasan ilmiah...
                </Text>
              </View>
            </View>

            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>
                ⏱️ Waktu proses: <Text style={{ fontWeight: '800' }}>{loadingSeconds} detik</Text> (Estimasi: 3 - 8 detik)
              </Text>
            </View>

            <Text style={styles.disclaimerText}>Mohon jangan menutup halaman ini selama AI sedang memproses.</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingTop: 20, paddingBottom: 110, paddingHorizontal: 16 },
  mainWrapper: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  desktopMainWrapper: { maxWidth: 1100, flexDirection: 'row', gap: 24, alignItems: 'flex-start' },

  formColumn: { flex: 1 },
  desktopFormColumn: { flex: 1.4 },
  desktopHelperColumn: { flex: 1, position: 'sticky' as any, top: 20 },

  header: { marginBottom: 16 },
  brandHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    flexWrap: 'wrap',
    gap: 14,
  },
  setupLogoImg: {
    width: 200,
    height: 85,
  },
  setupMascotTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  setupMascotImg: {
    width: 75,
    height: 55,
  },
  setupMascotTextBox: {
    justifyContent: 'center',
  },
  setupMascotTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  setupMascotSub: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  badge: { color: '#2563eb', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  sub: { fontSize: 14, color: '#64748b', lineHeight: 20 },

  // Quota Banner
  quotaBanner: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  quotaBannerPremium: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
  },
  quotaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  quotaIcon: { fontSize: 20 },
  quotaTitle: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  quotaSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  upgradeBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  upgradeBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },

  aiBanner: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  aiBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  aiDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563eb', marginRight: 10 },
  aiBannerTitle: { color: '#1e40af', fontSize: 14, fontWeight: '700' },
  aiBannerSub: { color: '#3b82f6', fontSize: 12, marginTop: 2 },
  settingsLink: { color: '#2563eb', fontSize: 13, fontWeight: '700', paddingLeft: 8 },

  // Source Selector (Kurikulum vs Kisi-Kisi)
  sourceSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  sourceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  sourceBtnActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  sourceBtnIcon: { fontSize: 22 },
  sourceBtnTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  sourceBtnTitleActive: { color: '#1d4ed8', fontWeight: '800' },
  sourceBtnSub: { fontSize: 11, color: '#64748b', marginTop: 1 },
  hotBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hotBadgeText: { color: '#1d4ed8', fontSize: 10, fontWeight: '800' },

  // Kisi-Kisi Upload Box & Cards
  kisiKisiContainer: {
    marginTop: 14,
  },
  uploadDropzone: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#93c5fd',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transitionProperty: 'all',
    transitionDuration: '0.2s',
  } as any,
  uploadDropzoneActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 2.5,
    borderStyle: 'solid',
    transform: [{ scale: 1.015 }],
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  uploadIconCircleActive: {
    backgroundColor: '#dbeafe',
    transform: [{ scale: 1.15 }],
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e3a8a',
    textAlign: 'center',
  },
  uploadTitleActive: {
    color: '#1d4ed8',
    fontSize: 15,
  },
  uploadSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 18,
  },
  uploadSubActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  uploadActionBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 6,
  },
  uploadActionBtnActive: {
    backgroundColor: '#1d4ed8',
    transform: [{ scale: 1.04 }],
  },
  uploadActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  dragPillHint: {
    marginTop: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dragPillHintText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },

  uploadedFileCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  uploadedFileCardDragging: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  dragReplaceOverlay: {
    marginTop: 6,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  dragReplaceText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadedFileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14532d',
    maxWidth: 240,
  },
  fileReadyBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fileReadyBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  fileMetaText: {
    fontSize: 11,
    color: '#15803d',
    marginTop: 2,
  },
  changeFileBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeFileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  thumbnailBox: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 8,
    alignItems: 'center',
  },
  imageThumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  thumbnailHint: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
    marginTop: 6,
  },

  // Kisi-Kisi Generation Mode
  kisiModeSection: {
    marginTop: 16,
  },
  kisiModeSectionHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 8,
  },
  kisiModeRow: {
    gap: 8,
  },
  kisiModeCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
  },
  kisiModeCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  kisiModeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  kisiModeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  kisiModeRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  kisiModeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  kisiModeTitleActive: {
    color: '#1d4ed8',
    fontWeight: '800',
  },
  kisiExactTag: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  kisiExactTagText: {
    color: '#b91c1c',
    fontSize: 10,
    fontWeight: '800',
  },
  kisiSimilarTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  kisiSimilarTagText: {
    color: '#b45309',
    fontSize: 10,
    fontWeight: '800',
  },
  kisiModeDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
    marginTop: 3,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  label: { fontSize: 13, fontWeight: '700', color: '#334155' },
  selectionIndicator: { fontSize: 12, color: '#2563eb', fontWeight: '600' },

  // Mode Cards
  modeCardsRow: { gap: 8, marginBottom: 10 },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  modeCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  modeCardIcon: { fontSize: 24 },
  modeCardTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 2 },
  modeCardTitleActive: { color: '#1d4ed8', fontWeight: '800' },
  modeCardDesc: { fontSize: 12, color: '#64748b', lineHeight: 17 },

  groupSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 8,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earlyChildhoodGrid: {
    gap: 8,
    marginBottom: 10,
  },
  earlyChildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  earlyChildBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 1.5,
  },
  earlyChildIcon: { fontSize: 22 },
  earlyChildTitle: { fontSize: 13, fontWeight: '700', color: '#334155' },
  earlyChildTitleActive: { color: '#1d4ed8', fontWeight: '800' },
  earlyChildDesc: { fontSize: 11, color: '#64748b', marginTop: 1 },

  gradeGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  gradeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  gradeBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    elevation: 1,
  },
  gradeNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  gradeNumberActive: {
    color: '#ffffff',
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  gradeTextActive: {
    color: '#e0e7ff',
  },

  row: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  periodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },

  periodBtn: {
    flex: 1,
    minWidth: 130,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 1.5,
  },
  periodBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  periodBtnTextActive: {
    color: '#1d4ed8',
    fontWeight: '800',
  },

  choiceBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  choiceBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  choiceText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  choiceTextActive: { color: '#ffffff', fontWeight: '800' },

  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
    color: '#0f172a',
    marginTop: 6,
  },
  inputHint: { fontSize: 11, color: '#94a3b8', marginTop: 4 },

  chipHeaderContainer: {
    marginTop: 14,
    marginBottom: 8,
  },
  chipHeader: { fontSize: 12, color: '#334155', fontWeight: '700' },
  chipSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  chipGrid: { flexDirection: 'column', gap: 8, marginBottom: 12 },
  chip: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderWidth: 1.5,
  },
  chipIcon: { fontSize: 18 },
  chipContent: { flex: 1 },
  chipSubject: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  chipSubjectActive: { color: '#2563eb' },
  chipText: { fontSize: 13, color: '#1e293b', fontWeight: '600', marginTop: 1 },
  chipTextActive: { color: '#1e40af', fontWeight: '700' },

  splitRow: { flexDirection: 'row', gap: 12, marginTop: 4 },

  btn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },

  // Desktop Helper Card
  helperCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  helperTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 10 },
  helperText: { fontSize: 14, color: '#64748b', lineHeight: 22, marginBottom: 16 },
  contextSummaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 18,
    gap: 4,
  },
  contextSummaryTitle: { fontSize: 12, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  contextSummaryItem: { fontSize: 13, color: '#334155' },

  featureItem: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  featureIcon: { fontSize: 22 },
  featureHeader: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  featureDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  statBox: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#2563eb', marginTop: 4 },

  // Subscription Modal
  subscriptionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    elevation: 5,
  },
  subModalHeader: { alignItems: 'center', marginBottom: 18 },
  subModalIcon: { fontSize: 36, marginBottom: 8 },
  subModalTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  subModalSubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4, lineHeight: 18 },

  pricingCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    marginBottom: 18,
  },
  pricingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planName: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  planBadge: { backgroundColor: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 6 },
  currency: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  priceAmount: { fontSize: 36, fontWeight: '900', color: '#2563eb', marginHorizontal: 4 },
  pricePeriod: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  priceNote: { fontSize: 12, color: '#16a34a', fontWeight: '600', marginBottom: 14 },
  discountAlert: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  discountAlertText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  couponTextInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  applyCouponBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyCouponBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  planFeatures: { gap: 8 },
  planFeatureItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planFeatureCheck: { fontSize: 14 },
  planFeatureText: { fontSize: 13, color: '#334155', flex: 1 },

  checkoutBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  checkoutBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  closeModalBtn: { paddingVertical: 10, alignItems: 'center' },
  closeModalBtnText: { color: '#64748b', fontSize: 13, fontWeight: '600' },

  // Loading Modal Styles
  modalOverlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999999,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  loadingTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 6 },
  loadingSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  boldText: { fontWeight: '700', color: '#2563eb' },
  stepsContainer: { width: '100%', gap: 10, marginBottom: 20 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepIcon: { fontSize: 16, marginRight: 10 },
  stepText: { fontSize: 13, color: '#64748b', fontWeight: '500', flex: 1 },
  stepDone: { color: '#0f172a', fontWeight: '600' },
  timerBadge: {
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  timerText: { color: '#1e40af', fontSize: 13 },
  disclaimerText: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },

  // Error Alert Card
  errorAlertCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  errorAlertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  errorAlertIcon: {
    fontSize: 20,
  },
  errorAlertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991b1b',
    marginBottom: 2,
  },
  errorAlertText: {
    fontSize: 13,
    color: '#b91c1c',
    lineHeight: 18,
  },
  errorDismissBtn: {
    padding: 4,
  },
  errorDismissText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '800',
  },

  // Navigation Controls for Single Horizontal Scroll Rows
  scrollNavControls: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  scrollNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollNavBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    lineHeight: 18,
    textAlign: 'center',
  },

  // 1-Row Horizontal Scroll Containers
  singleRowScroll: {
    marginBottom: 14,
    // @ts-ignore
    touchAction: 'pan-x',
  },
  singleRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 32,
    gap: 10,
    // @ts-ignore
    touchAction: 'pan-x',
  },

  // Curriculum Single Row Cards
  curriculumSingleCard: {
    width: 176,
    height: 74,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 10,
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    // @ts-ignore
    touchAction: 'pan-x',
    userSelect: 'none',
  },
  curriculumSingleCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    borderWidth: 2,
  },
  curriculumCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  curriculumFlag: {
    fontSize: 16,
  },
  curriculumCheckBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  curriculumCheckText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  curriculumCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 1,
  },
  curriculumCardTitleActive: {
    color: '#1d4ed8',
    fontWeight: '800',
  },
  curriculumCardSub: {
    fontSize: 10,
    color: '#64748b',
  },
  curriculumCardSubActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },

  // Grade Single Row Cards (PAUD / SD / SMP / SMA)
  gradeSingleCard: {
    width: 98,
    height: 86,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    // @ts-ignore
    touchAction: 'pan-x',
    userSelect: 'none',
  },
  gradeSingleCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    borderWidth: 2,
  },
  gradeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 2,
  },
  gradeTierPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gradeTierPillActive: {
    backgroundColor: '#dbeafe',
  },
  gradeTierPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
  },
  gradeTierPillTextActive: {
    color: '#1d4ed8',
  },
  gradeCheckIcon: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2563eb',
  },
  gradeMainTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 2,
  },
  gradeMainTitleActive: {
    color: '#1d4ed8',
  },
  gradeSubLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  gradeSubLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },

  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  langBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  langBtnActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  langBtnTextActive: {
    color: '#2563eb',
    fontWeight: '800',
  },

  customParamsBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  paramBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  paramBoxSub: {
    fontSize: 11,
    color: '#64748b',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  paramPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paramPillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  paramPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  paramPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

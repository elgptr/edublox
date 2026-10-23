import { getCurriculumTopics, CURRICULUM_TOPICS } from '../src/data/curriculumTopics';
import type { GradeLevel, Semester, ExamPeriod } from '../src/types';

describe('Curriculum Topics Matrix', () => {
  it('should have topics defined for all early childhood levels (pra-tk, tk, pra-sd) and primary grades (1 to 6)', () => {
    const grades: GradeLevel[] = ['pra-tk', 'tk', 'pra-sd', 1, 2, 3, 4, 5, 6];
    const semesters: Semester[] = ['I', 'II'];
    const periods: ExamPeriod[] = ['regular', 'pts', 'pas'];

    grades.forEach((grade) => {
      semesters.forEach((sem) => {
        periods.forEach((period) => {
          const topics = getCurriculumTopics(grade, sem, period);
          expect(topics).toBeDefined();
          expect(topics.length).toBeGreaterThan(0);
          expect(topics[0].topic).toBeTruthy();
          expect(topics[0].subject).toBeTruthy();
          expect(topics[0].icon).toBeTruthy();
        });
      });
    });
  });

  it('should contain early childhood topics with visual and sensory focus', () => {
    const praTkTopics = getCurriculumTopics('pra-tk', 'I', 'regular');
    expect(praTkTopics.some((t) => t.topic.includes('Warna'))).toBe(true);
    expect(praTkTopics.some((t) => t.topic.includes('Hewan'))).toBe(true);

    const tkTopics = getCurriculumTopics('tk', 'I', 'regular');
    expect(tkTopics.some((t) => t.topic.includes('1-10'))).toBe(true);
    expect(tkTopics.some((t) => t.topic.includes('Huruf Vokal'))).toBe(true);

    const praSdTopics = getCurriculumTopics('pra-sd', 'I', 'regular');
    expect(praSdTopics.some((t) => t.topic.includes('Calistung') || t.topic.includes('Suku Kata'))).toBe(true);
  });

  it('should dynamically switch topics between Pra-TK, TK, Pra-SD, and Grade 4', () => {
    const praTkTopics = getCurriculumTopics('pra-tk', 'I', 'regular');
    const tkTopics = getCurriculumTopics('tk', 'I', 'regular');
    const praSdTopics = getCurriculumTopics('pra-sd', 'I', 'regular');
    const grade4Topics = getCurriculumTopics(4, 'I', 'regular');

    expect(praTkTopics[0].topic).not.toEqual(tkTopics[0].topic);
    expect(tkTopics[0].topic).not.toEqual(praSdTopics[0].topic);
    expect(praSdTopics[0].topic).not.toEqual(grade4Topics[0].topic);
  });

  it('should return specific PTS topics when examPeriod is pts', () => {
    const ptsTopics = getCurriculumTopics('tk', 'I', 'pts');
    expect(ptsTopics.every((t) => t.topic.startsWith('PTS:'))).toBe(true);
  });

  it('should return specific PAS topics when examPeriod is pas', () => {
    const pasTopics = getCurriculumTopics('pra-sd', 'I', 'pas');
    expect(pasTopics.every((t) => t.topic.startsWith('PAS:'))).toBe(true);
  });

  describe('getCurriculumTopicsV2 multi-curriculum & multi-tier', () => {
    it('should support Cambridge CAIE curriculum for primary, lower secondary, and IGCSE', () => {
      const { getCurriculumTopicsV2 } = require('../src/data/curriculumTopics');
      const cambridgePri = getCurriculumTopicsV2('cambridge', 4, 'I', 'regular');
      expect(cambridgePri.length).toBeGreaterThan(0);
      expect(cambridgePri.some((t: any) => t.topic.includes('Cambridge') || t.topic.includes('Stage'))).toBe(true);

      const cambridgeIgcse = getCurriculumTopicsV2('cambridge', 10, 'I', 'regular');
      expect(cambridgeIgcse.length).toBeGreaterThan(0);
      expect(cambridgeIgcse.some((t: any) => t.subject.includes('IGCSE') || t.levelTag?.includes('IGCSE') || t.topic.includes('Extended'))).toBe(true);
    });

    it('should support Singapore MOE CPA approach & Bar Modeling', () => {
      const { getCurriculumTopicsV2 } = require('../src/data/curriculumTopics');
      const sgPrimary = getCurriculumTopicsV2('singapore', 5, 'I', 'regular');
      expect(sgPrimary.length).toBeGreaterThan(0);
      expect(sgPrimary.some((t: any) => t.topic.includes('Bar Modeling') || t.subject.includes('Singapore'))).toBe(true);
    });

    it('should support IB (PYP, MYP, DP) curriculum', () => {
      const { getCurriculumTopicsV2 } = require('../src/data/curriculumTopics');
      const ibDp = getCurriculumTopicsV2('ib', 11, 'I', 'regular');
      expect(ibDp.length).toBeGreaterThan(0);
      expect(ibDp.some((t: any) => t.levelTag?.includes('IB DP') || t.subject.includes('IB'))).toBe(true);
    });

    it('should support American Curriculum (Common Core, NGSS, AP)', () => {
      const { getCurriculumTopicsV2 } = require('../src/data/curriculumTopics');
      const usHighSchool = getCurriculumTopicsV2('american', 11, 'I', 'regular');
      expect(usHighSchool.length).toBeGreaterThan(0);
      expect(usHighSchool.some((t: any) => t.subject.includes('AP') || t.levelTag?.includes('AP'))).toBe(true);
    });

    it('should support Kurikulum Merdeka for SMP (7-9) and SMA (10-12)', () => {
      const { getCurriculumTopicsV2 } = require('../src/data/curriculumTopics');
      const smp7 = getCurriculumTopicsV2('merdeka', 7, 'I', 'regular');
      expect(smp7.length).toBeGreaterThan(0);
      expect(smp7.some((t: any) => t.levelTag === 'Fase D')).toBe(true);

      const sma12 = getCurriculumTopicsV2('merdeka', 12, 'I', 'regular');
      expect(sma12.length).toBeGreaterThan(0);
      expect(sma12.some((t: any) => t.levelTag === 'Fase F')).toBe(true);
    });
  });
});

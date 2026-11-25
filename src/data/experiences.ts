export interface Experience {
  id: string;
  type: 'work' | 'education';
  title: string;
  organization?: string;
  period: string;
  details?: string[];
  initiallyExpanded?: boolean;
}

export const experiences: Experience[] = [
  {
    id: 'ai-lab',
    initiallyExpanded: true,
    type: 'work',
    title: '국립군산대학교 인공지능연구실',
    organization: '연구실장',
    period: '2025.04 ~',
    details: [
      'Diffusion 모델 연구',
      'Transformer 모델 연구',
      '영상 프레임 보간 연구',
      'LLM 하네스 엔지니어링 개선 연구',
    ],
  },
  {
    id: 'computer-science-club',
    initiallyExpanded: true,
    type: 'work',
    title: '午前零時club',
    organization: '컴퓨터과학 동아리',
    period: '2026.03 ~',
    details: ['자료 구조 공부', '알고리즘 개발', '데이터베이스 관리'],
  },
  {
    id: 'ksnu',
    type: 'education',
    title: '국립군산대학교',
    organization: '컴퓨터정보공학과',
    period: '2025.03 ~',
  },
  {
    id: 'hansol',
    type: 'education',
    title: '한솔고등학교',
    period: '2021.03 ~ 2024.02',
  },
];

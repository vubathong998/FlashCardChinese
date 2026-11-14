import CvOnlineTemplate from '../../components/CvOnlineTemplate.jsx';

const sections = [
  {
    title: 'I. Personal Information',
    details: [
      ['Name', 'Vũ Bá Thông'],
      ['Address', 'Tan Hung – Lang Giang – Bac Ninh, Vietnam'],
      ['Phone', '0364 860 888'],
      ['Email', 'vubathong.it@gmail.com'],
      ['Website', 'vubathong.io.vn']
    ]
  },
  {
    title: 'II. Career Objective',
    paragraphs: ['I aim to apply my knowledge and experience to create value for the company while continuing to develop professionally.']
  },
  {
    title: 'III. Professional Skills',
    bullets: [
      ['Database and programming:', 'Able to work with SQL databases and C#.'],
      ['Networking and systems:', 'Foundational knowledge of networking and factory hardware. Able to independently analyze and resolve software/hardware issues and recommend preventive measures.'],
      ['Languages:', 'Basic English communication. Currently studying Chinese at HSK 3 level.'],
      ['Soft skills:', 'Strong willingness to learn, a sense of responsibility, and the ability to work under pressure.']
    ]
  },
  {
    title: 'IV. Work Experience',
    jobs: [
      {
        company: 'Aluminum Vieteco – Bac Ninh',
        role: 'IT Operations Specialist',
        period: 'Mar 2025 – Present',
        bullets: [
          'Responsible for installing, maintaining, and troubleshooting company-wide network, software, and hardware equipment.',
          'Analyze system issues and resolve them promptly to avoid affecting production schedules.',
          'Upgrade and develop software and hardware according to requirements.',
          'Support the QA department with equipment, measuring instruments, and calibration work.'
        ]
      },
      {
        company: 'Softcom Vietnam Solutions Co., Ltd. – Hanoi',
        role: 'Front-end Developer',
        period: 'Nov 2021 – Apr 2024',
        bullets: [
          'Developed and maintained management software systems using C# and .NET Core (previously .NET Framework).',
          'Trained and guided users on the administration website (CMS).'
        ]
      }
    ]
  },
  {
    title: 'V. Education',
    paragraphs: ['Hanoi University of Industry | Information Technology | Graduated in 2020']
  }
];

export default function CvOnlinePageEN() {
  return <CvOnlineTemplate title="Online Job Application CV" sections={sections} />;
}

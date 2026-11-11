import CvOnlineTemplate from '../components/CvOnlineTemplate.jsx';

const sections = [
  {
    title: 'I. 个人信息',
    details: [
      ['姓名', '武伯聪 (Vũ Bá Thông)'],
      ['地址', '越南北宁省谅江 – 新兴'],
      ['电话', '0364 860 888'],
      ['邮箱', 'vubathong.it@gmail.com'],
      ['个人网站', 'vubathong.io.vn']
    ]
  },
  {
    title: 'II. 职业目标',
    paragraphs: ['希望运用我的知识和经验为公司创造价值，同时不断提升自己。']
  },
  {
    title: 'III. 专业技能',
    bullets: [
      ['数据库与编程：', '能够使用 SQL 数据库和 C#。'],
      ['网络与系统：', '具备网络基础知识和工厂硬件经验。能够独立分析并解决软硬件故障，并提出预防措施。'],
      ['语言能力：', '具备基础英语沟通能力，目前正在学习中文 HSK 3 级。'],
      ['软技能：', '学习能力强、责任心强，能够承受工作压力。']
    ]
  },
  {
    title: 'IV. 工作经验',
    jobs: [
      {
        company: 'Aluminum Vieteco 公司 – 北宁',
        role: 'IT 运维专员',
        period: '2025 年 3 月 – 至今',
        bullets: [
          '负责全公司网络、软件及硬件设备的安装、维护和故障处理。',
          '分析系统故障并快速解决，确保不影响生产进度。',
          '根据需求进行软硬件升级与开发。',
          '协助 QA 部门处理设备、测量仪器和校准工作。'
        ]
      },
      {
        company: 'Softcom 越南解决方案有限公司 – 河内',
        role: '前端开发程序员',
        period: '2021 年 11 月 – 2024 年 4 月',
        bullets: [
          '使用 C# 和 .NET Core（升级前使用 .NET Framework）开发和维护管理软件系统。',
          '培训并指导用户使用管理网站 (CMS)。'
        ]
      }
    ]
  },
  {
    title: 'V. 教育背景',
    paragraphs: ['河内工业大学 | 信息技术专业 | 2020 年毕业']
  }
];

export default function CvOnlinePageCN() {
  return <CvOnlineTemplate title="在线简历" sections={sections} />;
}

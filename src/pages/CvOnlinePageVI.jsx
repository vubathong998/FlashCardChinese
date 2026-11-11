import CvOnlineTemplate from '../components/CvOnlineTemplate.jsx';

const sections = [
  {
    title: 'I. Thông tin cá nhân',
    details: [
      ['Họ và tên', 'Vũ Bá Thông (武伯聪)'],
      ['Địa chỉ', 'Tân Hưng – Lạng Giang – Bắc Ninh'],
      ['Điện thoại', '0364 860 888'],
      ['Email', 'vubathong.it@gmail.com'],
      ['Website cá nhân', 'vubathong.io.vn']
    ]
  },
  {
    title: 'II. Mục tiêu nghề nghiệp',
    paragraphs: ['Mong muốn vận dụng kiến thức và kinh nghiệm để đóng góp giá trị cho công ty, đồng thời phát triển bản thân.']
  },
  {
    title: 'III. Kỹ năng chuyên môn',
    bullets: [
      ['Cơ sở dữ liệu và lập trình:', 'Có thể làm việc với cơ sở dữ liệu SQL và C#.'],
      ['Mạng và hệ thống:', 'Có kiến thức cơ bản về mạng và phần cứng nhà máy. Có thể độc lập phân tích, xử lý sự cố phần mềm/phần cứng và đề xuất biện pháp phòng ngừa.'],
      ['Ngoại ngữ:', 'Giao tiếp tiếng Anh cơ bản. Hiện đang học tiếng Trung HSK 3.'],
      ['Kỹ năng mềm:', 'Có khả năng học hỏi tốt, tinh thần trách nhiệm và chịu được áp lực công việc.']
    ]
  },
  {
    title: 'IV. Kinh nghiệm làm việc',
    jobs: [
      {
        company: 'Công ty Aluminum Vieteco – Bắc Ninh',
        role: 'Chuyên viên IT vận hành',
        period: '03/2025 – nay',
        bullets: [
          'Phụ trách lắp đặt, bảo trì và xử lý sự cố mạng, phần mềm, thiết bị phần cứng trong toàn công ty.',
          'Phân tích lỗi hệ thống và xử lý nhanh để không ảnh hưởng đến tiến độ sản xuất.',
          'Nâng cấp và phát triển phần mềm/phần cứng theo yêu cầu.',
          'Hỗ trợ bộ phận QA xử lý thiết bị, dụng cụ đo lường và công việc hiệu chuẩn.'
        ]
      },
      {
        company: 'Công ty TNHH Giải pháp Softcom Việt Nam – Hà Nội',
        role: 'Lập trình viên Front-end',
        period: '11/2021 – 04/2024',
        bullets: [
          'Phát triển và bảo trì hệ thống phần mềm quản lý bằng C# và .NET Core (.NET Framework trước khi nâng cấp).',
          'Đào tạo và hướng dẫn sử dụng trang quản trị (CMS).'
        ]
      }
    ]
  },
  {
    title: 'V. Học vấn',
    paragraphs: ['Đại học Công nghiệp Hà Nội | Chuyên ngành Công nghệ thông tin | Tốt nghiệp năm 2020']
  }
];

export default function CvOnlinePageVI() {
  return <CvOnlineTemplate title="CV online ứng tuyển" sections={sections} />;
}

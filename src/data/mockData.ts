import { Task, EvaluationItem, RoleInfo, TaskHistoryItem, TaskDocument } from '../types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'SEC-001',
    receivedDate: '2026-09-28',
    category: 'งานประสานงาน',
    assignee: 'นายสมชาย เจ้าหน้าที่ ก. (ฝ่ายประสานมวลชน)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-10-06',
    status: 'รอติดตาม',
    lastTrackedDate: '2026-10-03',
    nextTrackingDate: '2026-10-06',
    summary: 'ประสานงานเตรียมความพร้อมการฝึกอบรมทบทวนชุดรักษาความปลอดภัยหมู่บ้าน (ชรบ.) ร่วมกับที่ว่าการอำเภอเมืองสงขลา',
    notes: 'รอรายชื่อผู้เข้ารับการอบรมเพิ่มเติมจากอำเภอเมืองสงขลา จำนวน 40 นาย',
    workflowStep: 4,
    priority: 'สำคัญ',
    createdAt: '2026-09-28T08:30:00Z',
    updatedAt: '2026-10-03T14:15:00Z'
  },
  {
    id: 'SEC-002',
    receivedDate: '2026-09-29',
    category: 'งานเอกสาร',
    assignee: 'นางสาวสุดา เจ้าหน้าที่ ข. (งานสารบรรณและความมั่นคง)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-10-04',
    status: 'อยู่ระหว่างดำเนินการ',
    lastTrackedDate: '2026-10-02',
    nextTrackingDate: '2026-10-05',
    summary: 'รวบรวมและตรวจสอบรายงานผลการปฏิบัติงานด้านความมั่นคงประจำเดือน กันยายน จาก 16 อำเภอ',
    notes: 'ส่งรายงานครบแล้ว 13 อำเภอ อยู่ระหว่างติดตาม 3 อำเภอ (นาทวี, สะเดา, จะนะ)',
    workflowStep: 3,
    priority: 'เร่งด่วน',
    createdAt: '2026-09-29T09:00:00Z',
    updatedAt: '2026-10-02T16:30:00Z'
  },
  {
    id: 'SEC-003',
    receivedDate: '2026-10-01',
    category: 'งานประชุม/ประสานหน่วยงาน',
    assignee: 'นายกิตติ เจ้าหน้าที่ ค. (งานนโยบายและแผน)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-10-08',
    status: 'อยู่ระหว่างดำเนินการ',
    lastTrackedDate: '2026-10-04',
    nextTrackingDate: '2026-10-07',
    summary: 'จัดเตรียมระเบียบวาระและเอกสารประกอบการประชุมคณะกรรมการรักษาความสงบเรียบร้อยจังหวัดสงขลา ครั้งที่ 10/2569',
    notes: 'ประสานส่งหนังสือเชิญประชุมไปยัง 28 หน่วยงานภาคีเรียบร้อยแล้ว',
    workflowStep: 3,
    priority: 'สำคัญ',
    createdAt: '2026-10-01T10:15:00Z',
    updatedAt: '2026-10-04T11:00:00Z'
  },
  {
    id: 'SEC-004',
    receivedDate: '2026-09-20',
    category: 'งานสนับสนุนการปฏิบัติงาน',
    assignee: 'นายสมชาย เจ้าหน้าที่ ก. (ฝ่ายประสานมวลชน)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-09-30',
    status: 'เสร็จสิ้น',
    lastTrackedDate: '2026-09-30',
    nextTrackingDate: '2026-09-30',
    summary: 'สนับสนุนชุดอุปกรณ์สื่อสารและเครื่องหมายแสดงตนแก่ชุดปฏิบัติการจัดระเบียบสังคมร่วมระดับอำเภอ',
    notes: 'ดำเนินการตรวจรับและส่งมอบอุปกรณ์ครบถ้วนตามรายการเรียบร้อยแล้ว',
    workflowStep: 5,
    priority: 'ปกติ',
    createdAt: '2026-09-20T11:30:00Z',
    updatedAt: '2026-09-30T16:45:00Z'
  },
  {
    id: 'SEC-005',
    receivedDate: '2026-10-02',
    category: 'งานติดตามเรื่อง',
    assignee: 'นายวิชาญ เจ้าหน้าที่ ง. (ฝ่ายติดตามประเมินผล)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-10-07',
    status: 'อยู่ระหว่างดำเนินการ',
    lastTrackedDate: '2026-10-04',
    nextTrackingDate: '2026-10-06',
    summary: 'ติดตามความคืบหน้าโครงการเสริมสร้างความเข้มแข็งหมู่บ้าน/ชุมชน ตามแผนปฏิบัติการความมั่นคง ประจำปี 2569',
    notes: 'อยู่ระหว่างวิเคราะห์ข้อมูลแบบรายงานผลการดำเนินงานระดับตำบล',
    workflowStep: 4,
    priority: 'ปกติ',
    createdAt: '2026-10-02T13:20:00Z',
    updatedAt: '2026-10-04T15:10:00Z'
  },
  {
    id: 'SEC-006',
    receivedDate: '2026-10-04',
    category: 'งานเอกสาร',
    assignee: 'นางสาวสุดา เจ้าหน้าที่ ข. (งานสารบรรณและความมั่นคง)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-10-12',
    status: 'รอดำเนินการ',
    lastTrackedDate: '2026-10-04',
    nextTrackingDate: '2026-10-08',
    summary: 'ตรวจทานหนังสือแจ้งเวียนมาตรการรักษาความปลอดภัยสถานที่ราชการในช่วงวันหยุดยาวต่อเนื่อง',
    notes: 'รอลงนามจากหัวหน้ากลุ่มงานความมั่นคงเพื่อเสนอปลัดจังหวัด',
    workflowStep: 2,
    priority: 'ปกติ',
    createdAt: '2026-10-04T09:40:00Z',
    updatedAt: '2026-10-04T09:40:00Z'
  },
  {
    id: 'SEC-007',
    receivedDate: '2026-09-25',
    category: 'งานประสานงาน',
    assignee: 'นายกิตติ เจ้าหน้าที่ ค. (งานนโยบายและแผน)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-10-02',
    status: 'รอติดตาม',
    lastTrackedDate: '2026-10-03',
    nextTrackingDate: '2026-10-05',
    summary: 'ประสานงานสำนักงานป้องกันและบรรเทาสาธารณภัยจังหวัดสงขลา เพื่อจัดทำแผนเผชิญเหตุและเตรียมจุดอพยพรองรับสถานการณ์อุทกภัย',
    notes: 'เกินกำหนดส่งแบบสรุปจุดอพยพจาก 2 อำเภอริมทะเลสาบสงขลา อยู่ระหว่างประสานซ้ำ',
    workflowStep: 4,
    priority: 'เร่งด่วน',
    createdAt: '2026-09-25T14:00:00Z',
    updatedAt: '2026-10-03T10:00:00Z'
  },
  {
    id: 'SEC-008',
    receivedDate: '2026-09-18',
    category: 'งานอื่น ๆ',
    assignee: 'นายวิชาญ เจ้าหน้าที่ ง. (ฝ่ายติดตามประเมินผล)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-09-28',
    status: 'เสร็จสิ้น',
    lastTrackedDate: '2026-09-27',
    nextTrackingDate: '2026-09-28',
    summary: 'จัดทำรายงานสรุปผลกิจกรรมการมีส่วนร่วมของภาคประชาชนในการดูแลความสงบเรียบร้อยหมู่บ้านเฉลิมพระเกียรติ',
    notes: 'จัดส่งรายงานรูปเล่มให้กรมการปกครองเรียบร้อยแล้ว',
    workflowStep: 5,
    priority: 'ปกติ',
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-09-27T17:00:00Z'
  },
  {
    id: 'SEC-009',
    receivedDate: '2026-10-03',
    category: 'งานสนับสนุนการปฏิบัติงาน',
    assignee: 'นายสมชาย เจ้าหน้าที่ ก. (ฝ่ายประสานมวลชน)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-10-15',
    status: 'รอดำเนินการ',
    lastTrackedDate: '2026-10-03',
    nextTrackingDate: '2026-10-09',
    summary: 'เตรียมการจัดนิทรรศการเผยแพร่ความรู้ด้านการมีส่วนร่วมรักษาความปลอดภัยของชุมชน ในงานวันกำนันผู้ใหญ่บ้าน',
    notes: 'อยู่ระหว่างขออนุมัติใช้วัสดุอุปกรณ์และจัดพิมพ์แผ่นพับ',
    workflowStep: 1,
    priority: 'ปกติ',
    createdAt: '2026-10-03T11:20:00Z',
    updatedAt: '2026-10-03T11:20:00Z'
  },
  {
    id: 'SEC-010',
    receivedDate: '2026-09-15',
    category: 'งานประสานงาน',
    assignee: 'นายกิตติ เจ้าหน้าที่ ค. (งานนโยบายและแผน)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-09-25',
    status: 'เสร็จสิ้น',
    lastTrackedDate: '2026-09-25',
    nextTrackingDate: '2026-09-25',
    summary: 'ประสานงานสำนักงานสาธารณสุขจังหวัดและตำรวจภูธรจังหวัด ในการร่วมตรวจสอบสถานประกอบการตามมาตรการจัดระเบียบสังคม',
    notes: 'สรุปผลการตรวจและลงนามบันทึกข้อตกลงร่วมกันแล้ว',
    workflowStep: 5,
    priority: 'สำคัญ',
    createdAt: '2026-09-15T08:50:00Z',
    updatedAt: '2026-09-25T15:30:00Z'
  },
  {
    id: 'SEC-011',
    receivedDate: '2026-10-04',
    category: 'งานเอกสาร',
    assignee: 'นางสาวสุดา เจ้าหน้าที่ ข. (งานสารบรรณและความมั่นคง)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-10-14',
    status: 'พัก/รอข้อมูล',
    lastTrackedDate: '2026-10-04',
    nextTrackingDate: '2026-10-10',
    summary: 'ตรวจเอกสารขอรับเงินสงเคราะห์สมาชิกกองอาสารักษาดินแดน (อส.) ที่ได้รับผลกระทบจากการปฏิบัติหน้าที่',
    notes: 'รอเอกสารใบรับรองแพทย์ฉบับจริงจากโรงพยาบาลสงขลาเพิ่มเติม',
    workflowStep: 2,
    priority: 'สำคัญ',
    createdAt: '2026-10-04T14:10:00Z',
    updatedAt: '2026-10-04T16:00:00Z'
  },
  {
    id: 'SEC-012',
    receivedDate: '2026-10-05',
    category: 'งานติดตามเรื่อง',
    assignee: 'นายวิชาญ เจ้าหน้าที่ ง. (ฝ่ายติดตามประเมินผล)',
    department: 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา',
    deadline: '2026-10-11',
    status: 'รอดำเนินการ',
    lastTrackedDate: '2026-10-05',
    nextTrackingDate: '2026-10-07',
    summary: 'ติดตามข้อสั่งการจากการประชุมศูนย์ปฏิบัติการร่วมเพื่อการรักษาความสงบเรียบร้อยระดับจังหวัด ประจำสัปดาห์',
    notes: 'เพิ่งรับเรื่องเข้าสู่สารบรรณกลุ่มงาน กำลังจัดทำตารางติดตามข้อสั่งการ',
    workflowStep: 1,
    priority: 'ปกติ',
    createdAt: '2026-10-05T08:15:00Z',
    updatedAt: '2026-10-05T08:15:00Z'
  }
];

export const INITIAL_EVALUATIONS: EvaluationItem[] = [
  {
    id: 'EV-001',
    evaluatorName: 'อาจารย์ที่ปรึกษาโครงงาน CWIE',
    role: 'อาจารย์นิเทศก์ มหาวิทยาลัยทักษิณ',
    date: '2026-10-02',
    ratings: {
      easeOfUse: 5,
      clarity: 5,
      convenience: 4,
      layoutSuitability: 5,
      operationalBenefit: 5
    },
    comments: 'ระบบออกแบบสอดคล้องกับระเบียบราชการ การแบ่งขั้นตอน 5 ขั้นชัดเจน และมีระบบแจ้งเตือนกำหนดเวลาที่ช่วยลดข้อผิดพลาดในการปฏิบัติงาน'
  },
  {
    id: 'EV-002',
    evaluatorName: 'หัวหน้ากลุ่มงานความมั่นคง (จำลอง)',
    role: 'ผู้ควบคุมการปฏิบัติงาน CWIE ในหน่วยงาน',
    date: '2026-10-03',
    ratings: {
      easeOfUse: 4,
      clarity: 5,
      convenience: 5,
      layoutSuitability: 4,
      operationalBenefit: 5
    },
    comments: 'ช่วยให้เห็นภาพรวมงานค้างและงานที่ใกล้ถึงกำหนดได้อย่างรวดเร็ว ไม่ต้องเปิดสมุดบันทึกหรือค้นหาเอกสารจากแฟ้มหลายแฟ้ม'
  },
  {
    id: 'EV-003',
    evaluatorName: 'นักศึกษาสหกิจศึกษา CWIE',
    role: 'ผู้พัฒนาโครงงาน (นิสิต ม.ทักษิณ)',
    date: '2026-10-04',
    ratings: {
      easeOfUse: 5,
      clarity: 4,
      convenience: 5,
      layoutSuitability: 5,
      operationalBenefit: 4
    },
    comments: 'การจัดเก็บข้อมูลผ่าน LocalStorage ทำให้ทดสอบได้ทันทีโดยไม่ต้องพึ่งพาเซิร์ฟเวอร์ เหมาะอย่างยิ่งสำหรับการสาธิตโครงงาน'
  }
];

export const ROLES: Record<string, RoleInfo> = {
  admin: {
    id: 'admin',
    title: 'ผู้ดูแลระบบ (Admin)',
    description: 'มีสิทธิ์เต็ม: ดูข้อมูล, เพิ่ม, แก้ไข, ลบ, จัดการข้อมูลตัวอย่าง, และส่งออกรายงาน',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canReset: true
  },
  staff: {
    id: 'staff',
    title: 'เจ้าหน้าที่ (Staff)',
    description: 'มีสิทธิ์ปฏิบัติงาน: ดูข้อมูล, เพิ่มงาน, แก้ไขงาน, และติดตามสถานะ',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canReset: false
  },
  viewer: {
    id: 'viewer',
    title: 'ผู้ดู (Viewer)',
    description: 'มีสิทธิ์อ่านอย่างเดียว: ดูข้อมูล, ดู Dashboard, และส่งออกรายงาน',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canReset: false
  }
};

export const INITIAL_HISTORY: TaskHistoryItem[] = [
  {
    id: 'HIST-001',
    timestamp: '2026-09-28 08:30:00',
    taskId: 'SEC-001',
    previousStatus: 'รับเรื่อง',
    newStatus: 'มอบหมาย',
    operator: 'ผู้ดูแลระบบ (Admin)',
    details: 'รับเรื่องการฝึกอบรม ชรบ. จากอำเภอเมืองสงขลา และมอบหมายให้ฝ่ายประสานมวลชน'
  },
  {
    id: 'HIST-002',
    timestamp: '2026-09-30 10:15:00',
    taskId: 'SEC-001',
    previousStatus: 'มอบหมาย',
    newStatus: 'อยู่ระหว่างดำเนินการ',
    operator: 'นายสมชาย เจ้าหน้าที่ ก.',
    details: 'จัดทำหนังสือประสานงานขอรับการสนับสนุนวิทยากรและจัดเตรียมสถานที่'
  },
  {
    id: 'HIST-003',
    timestamp: '2026-10-03 14:15:00',
    taskId: 'SEC-001',
    previousStatus: 'อยู่ระหว่างดำเนินการ',
    newStatus: 'รอติดตาม',
    operator: 'นายสมชาย เจ้าหน้าที่ ก.',
    details: 'รอรายชื่อผู้เข้ารับการอบรมเพิ่มเติม 40 นายจากอำเภอเมืองสงขลา'
  },
  {
    id: 'HIST-004',
    timestamp: '2026-09-29 09:00:00',
    taskId: 'SEC-002',
    previousStatus: 'รับเรื่อง',
    newStatus: 'มอบหมาย',
    operator: 'ผู้ดูแลระบบ (Admin)',
    details: 'ลงทะเบียนรับรายงานผลประจำเดือน และมอบหมายงานสารบรรณ'
  },
  {
    id: 'HIST-005',
    timestamp: '2026-10-02 16:30:00',
    taskId: 'SEC-002',
    previousStatus: 'มอบหมาย',
    newStatus: 'อยู่ระหว่างดำเนินการ',
    operator: 'นางสาวสุดา เจ้าหน้าที่ ข.',
    details: 'รวบรวมรายงานได้แล้ว 13 อำเภอ อยู่ระหว่างเร่งรัด 3 อำเภอที่เหลือ'
  },
  {
    id: 'HIST-006',
    timestamp: '2026-09-20 11:30:00',
    taskId: 'SEC-004',
    previousStatus: 'รับเรื่อง',
    newStatus: 'มอบหมาย',
    operator: 'หัวหน้ากลุ่มงานความมั่นคง',
    details: 'อนุมัติการสนับสนุนชุดอุปกรณ์สื่อสารและมอบหมายฝ่ายประสานมวลชน'
  },
  {
    id: 'HIST-007',
    timestamp: '2026-09-25 14:00:00',
    taskId: 'SEC-004',
    previousStatus: 'มอบหมาย',
    newStatus: 'อยู่ระหว่างดำเนินการ',
    operator: 'นายสมชาย เจ้าหน้าที่ ก.',
    details: 'เบิกจ่ายอุปกรณ์สื่อสารจากคลังพัสดุและตรวจสอบสภาพความพร้อม'
  },
  {
    id: 'HIST-008',
    timestamp: '2026-09-30 16:45:00',
    taskId: 'SEC-004',
    previousStatus: 'อยู่ระหว่างดำเนินการ',
    newStatus: 'เสร็จสิ้น',
    operator: 'นายสมชาย เจ้าหน้าที่ ก.',
    details: 'ตรวจรับและส่งมอบอุปกรณ์ครบถ้วนตามรายการเรียบร้อย ปิดงาน'
  },
  {
    id: 'HIST-009',
    timestamp: '2026-09-15 08:50:00',
    taskId: 'SEC-010',
    previousStatus: 'รับเรื่อง',
    newStatus: 'มอบหมาย',
    operator: 'ผู้ดูแลระบบ (Admin)',
    details: 'รับหนังสือประสานงานตรวจสถานบริการ มอบหมายงานนโยบายและแผน'
  },
  {
    id: 'HIST-010',
    timestamp: '2026-09-20 10:00:00',
    taskId: 'SEC-010',
    previousStatus: 'มอบหมาย',
    newStatus: 'อยู่ระหว่างดำเนินการ',
    operator: 'นายกิตติ เจ้าหน้าที่ ค.',
    details: 'ร่วมประชุมวางแผนตรวจร่วมกับสาธารณสุขและตำรวจภูธรจังหวัด'
  },
  {
    id: 'HIST-011',
    timestamp: '2026-09-25 15:30:00',
    taskId: 'SEC-010',
    previousStatus: 'อยู่ระหว่างดำเนินการ',
    newStatus: 'เสร็จสิ้น',
    operator: 'นายกิตติ เจ้าหน้าที่ ค.',
    details: 'สรุปผลการตรวจและลงนามบันทึกข้อตกลงร่วมกันเรียบร้อย ปิดงาน'
  }
];

export const INITIAL_DOCUMENTS: TaskDocument[] = [
  {
    id: 'DOC-001',
    taskId: 'SEC-001',
    fileName: 'หนังสือประสานงานฝึกอบรม_ชรบ_เมืองสงขลา.pdf',
    fileType: 'application/pdf',
    fileSize: '320 KB',
    driveFileId: 'demo-drive-001',
    driveUrl: 'https://drive.google.com/file/d/demo-drive-001/view',
    uploadedDate: '2026-09-28',
    uploadedBy: 'ผู้ดูแลระบบ (Admin)'
  },
  {
    id: 'DOC-002',
    taskId: 'SEC-001',
    fileName: 'รายชื่อผู้เข้ารับการอบรมเบื้องต้น.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: '145 KB',
    driveFileId: 'demo-drive-002',
    driveUrl: 'https://drive.google.com/file/d/demo-drive-002/view',
    uploadedDate: '2026-09-30',
    uploadedBy: 'นายสมชาย เจ้าหน้าที่ ก.'
  },
  {
    id: 'DOC-003',
    taskId: 'SEC-002',
    fileName: 'รายงานสรุปผลการปฏิบัติงาน_กย2569.pdf',
    fileType: 'application/pdf',
    fileSize: '1.8 MB',
    driveFileId: 'demo-drive-003',
    driveUrl: 'https://drive.google.com/file/d/demo-drive-003/view',
    uploadedDate: '2026-09-29',
    uploadedBy: 'ผู้ดูแลระบบ (Admin)'
  },
  {
    id: 'DOC-004',
    taskId: 'SEC-003',
    fileName: 'ระเบียบวาระการประชุม_ครั้งที่10_2569.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: '210 KB',
    driveFileId: 'demo-drive-004',
    driveUrl: 'https://drive.google.com/file/d/demo-drive-004/view',
    uploadedDate: '2026-10-01',
    uploadedBy: 'นายกิตติ เจ้าหน้าที่ ค.'
  },
  {
    id: 'DOC-005',
    taskId: 'SEC-004',
    fileName: 'ใบส่งมอบและตรวจรับอุปกรณ์สื่อสาร.pdf',
    fileType: 'application/pdf',
    fileSize: '480 KB',
    driveFileId: 'demo-drive-005',
    driveUrl: 'https://drive.google.com/file/d/demo-drive-005/view',
    uploadedDate: '2026-09-25',
    uploadedBy: 'นายสมชาย เจ้าหน้าที่ ก.'
  }
];



import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Clock,
  Send,
  HelpCircle,
  Camera,
  Layers,
  ShieldCheck,
  Download,
  Printer,
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';

export const UserGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-900" />
          คู่มือการใช้งานระบบ SOTS (ต้นแบบ CWIE)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          คำอธิบายขั้นตอนการปฏิบัติงาน 5 ขั้นตอน การใช้งานปุ่มฟังก์ชัน และจุดแนะนำสำหรับการจับภาพหน้าจอ (Screenshots) ในรายงานผลการดำเนินงาน CWIE
        </p>
      </div>

      {/* 5 Operational Steps */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-900" />
          กระบวนการทำงาน 5 ขั้นตอนหลัก (Operational Workflow)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          {/* Step 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">รับเรื่อง / รับข้อมูล</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              รับเรื่องจากหนังสือราชการ บันทึกข้อความ หรือการประสานงานภายนอก เข้าสู่สารบรรณกลุ่มงานความมั่นคง
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">บันทึกข้อมูล</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              กดปุ่ม “+ เพิ่มงานใหม่” บันทึกรหัสงาน วันที่รับเรื่อง ประเภทงาน สาระสำคัญ และวันที่กำหนดติดตาม
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">มอบหมาย / ประสานงาน</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ระบุผู้รับผิดชอบหรือฝ่ายที่เกี่ยวข้อง พร้อมส่งต่อข้อมูลไปยังอำเภอหรือหน่วยงานภาคีเครือข่าย
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-sm">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">ติดตามสถานะ</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ตรวจสอบสถานะกำหนดติดตาม (ตามกำหนด / ใกล้ถึงกำหนด / เกินกำหนด) และอัปเดตความคืบหน้าระหว่างทาง
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
              5
            </div>
            <h3 className="font-bold text-slate-900 text-sm">บันทึกผล / ปิดงาน</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              เมื่อภารกิจสำเร็จ เปลี่ยนสถานะเป็น “เสร็จสิ้น” บันทึกข้อสรุป และจัดเก็บเป็นประวัติการปฏิบัติงาน
            </p>
          </div>
        </div>
      </div>

      {/* Button & Feature Encyclopedia */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-900" />
          คำอธิบายปุ่มและฟังก์ชันสำคัญในระบบ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 flex items-start gap-3">
            <div className="p-2 bg-blue-900 text-white rounded-md shrink-0">
              + เพิ่มงานใหม่
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">ปุ่มเพิ่มงานใหม่</strong>
              <span className="text-slate-600">
                เปิดหน้าฟอร์ม 10 ฟิลด์สำหรับลงทะเบียนงานใหม่ ระบบคำนวณรหัส SEC อัตโนมัติและตรวจสอบฟิลด์จำเป็น
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 flex items-start gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-md shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">ส่งออก CSV</strong>
              <span className="text-slate-600">
                ดาวน์โหลดตารางงานเป็นไฟล์ CSV ที่มี UTF-8 BOM ทำให้เปิดใน Microsoft Excel ภาษาไทยได้ทันทีไม่เพี้ยน
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 flex items-start gap-3">
            <div className="p-2 bg-blue-900 text-white rounded-md shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">พิมพ์รายงาน</strong>
              <span className="text-slate-600">
                เปิดหน้าต่างเอกสารทางการพร้อมหัวจดหมายที่ทำการปกครองจังหวัดสงขลา ตารางสรุป และช่องลงชื่อเพื่อพิมพ์หรือ Save เป็น PDF
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 flex items-start gap-3">
            <div className="p-2 bg-slate-200 text-slate-700 rounded-md shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">รีเซ็ตข้อมูลตัวอย่าง</strong>
              <span className="text-slate-600">
                คืนค่าข้อมูลตัวอย่างเริ่มต้น 12 รายการในกรณีที่ทดลองลบหรือเพิ่มข้อมูลแล้วต้องการนำเสนองานใหม่
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guide for CWIE Report Screenshots */}
      <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2 text-blue-200">
          <Camera className="w-5 h-5 text-blue-300" />
          จุดแนะนำสำหรับการจับภาพหน้าจอ (Screenshots) ในรายงานเล่มโครงงาน CWIE
        </h2>
        <p className="text-xs text-slate-300">
          นักศึกษาสามารถนำภาพหน้าจอจากแต่ละส่วนไปประกอบในเล่มรายงานโครงงานพัฒนางานสหกิจศึกษา (CWIE) ได้ดังนี้:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/10 p-3.5 rounded-lg border border-white/10">
            <span className="font-bold text-blue-300 block mb-1">1. หน้า Dashboard ภาพรวม</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              จับภาพการ์ดสรุป 5 ใบ + แถบสถานะงาน เพื่อแสดงความสามารถในการคำนวณและสรุปภาระงานอัตโนมัติ
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-lg border border-white/10">
            <span className="font-bold text-blue-300 block mb-1">2. ตารางจัดการรายการงาน</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              จับภาพระบบค้นหา ตัวกรองสถานะ และแท็กแจ้งเตือน “ใกล้ถึงกำหนด” / “เกินกำหนด”
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-lg border border-white/10">
            <span className="font-bold text-blue-300 block mb-1">3. หน้ารายละเอียดงาน (Modal)</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              จับภาพ Timeline 5 ขั้นตอน (CWIE Workflow Simulation) และแถบข้อมูล 3 ส่วน
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-lg border border-white/10">
            <span className="font-bold text-blue-300 block mb-1">4. ฟอร์มเพิ่ม/แก้ไขงาน 10 ฟิลด์</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              จับภาพแบบฟอร์มบันทึกข้อมูล พร้อมแสดงกล่องแจ้งเตือนความปลอดภัยของข้อมูล
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-lg border border-white/10">
            <span className="font-bold text-blue-300 block mb-1">5. สถิติและรายงานผล</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              จับภาพกราฟสัดส่วนประเภทงาน และประสิทธิภาพการดำเนินงานตามกำหนดเวลา (On-time Rate)
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-lg border border-white/10">
            <span className="font-bold text-blue-300 block mb-1">6. หน้าประเมินการใช้งาน</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              จับภาพผลการประเมิน 5 ด้าน และคะแนนเฉลี่ยรวม เพื่อสรุปผลการวิจัย/พัฒนางาน
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

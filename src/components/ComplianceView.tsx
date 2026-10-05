import React from 'react';
import {
  ShieldAlert,
  Lock,
  FileCheck2,
  AlertTriangle,
  Scale,
  Building,
  GraduationCap
} from 'lucide-react';

export const ComplianceView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-900" />
          ข้อกำหนดการใช้งานและการคุ้มครองข้อมูล
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          เงื่อนไขและมาตรการความปลอดภัยสำหรับระบบสนับสนุนการติดตามงานด้านความมั่นคง (ต้นแบบ)
        </p>
      </div>

      {/* Primary Terms Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
          <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
          <div>
            <h2 className="font-bold text-sm">ประกาศสำคัญ: ต้นแบบโครงงานเพื่อการศึกษา (CWIE Prototype)</h2>
            <p className="text-xs mt-0.5 leading-relaxed text-amber-800">
              ระบบนี้พัฒนาขึ้นเพื่อวัตถุประสงค์ในการศึกษาและวิจัยกระบวนการพัฒนางานตามหลักสูตรสหกิจศึกษา (CWIE)
              ของนิสิตมหาวิทยาลัยทักษิณ <strong>มิใช่ระบบราชการอย่างเป็นทางการ</strong> ของที่ทำการปกครองจังหวัดสงขลา
            </p>
          </div>
        </div>

        {/* 7 Official Compliance Points */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-900" />
            ข้อกำหนดและเงื่อนไขการใช้งานระบบ 7 ประการ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <strong className="text-slate-900 font-bold block">
                1. วัตถุประสงค์เพื่อการศึกษา
              </strong>
              <p className="text-slate-600 leading-relaxed">
                ระบบนี้เป็นเพียงโครงงานต้นแบบ (Proof of Concept) สำหรับสาธิตกระบวนการติดตามงานและวิเคราะห์ประสิทธิภาพการดำเนินงาน
              </p>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1">
              <strong className="text-rose-900 font-bold block">
                2. ข้อห้ามเกี่ยวกับข้อมูลลับทางราชการ
              </strong>
              <p className="text-rose-800 leading-relaxed">
                <strong>ห้ามนำเข้าหรือบันทึกข้อมูลความลับทางราชการ</strong> ข้อมูลชั้นความลับ (ลับ/ลับมาก/ลับที่สุด) เข้าสู่ระบบต้นแบบนี้โดยเด็ดขาด
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <strong className="text-slate-900 font-bold block">
                3. การคุ้มครองข้อมูลส่วนบุคคล (PDPA)
              </strong>
              <p className="text-slate-600 leading-relaxed">
                ห้ามนำเข้าข้อมูลส่วนบุคคลที่ไม่จำเป็น หรือข้อมูลที่สามารถระบุตัวตนบุคคลจริงได้ ให้ใช้เฉพาะชื่อสมมติและข้อมูลสมมติเท่านั้น
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <strong className="text-slate-900 font-bold block">
                4. การใช้ข้อมูลจำลอง (Demo Data)
              </strong>
              <p className="text-slate-600 leading-relaxed">
                ข้อมูลงาน รหัสงาน เจ้าหน้าที่ และสถานการณ์ทั้งหมดในระบบนี้ เป็นข้อมูลที่สร้างขึ้นเพื่อการจำลองระบบเท่านั้น
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <strong className="text-slate-900 font-bold block">
                5. การขออนุมัติก่อนใช้งานจริง
              </strong>
              <p className="text-slate-600 leading-relaxed">
                การนำระบบหรือแนวคิดนี้ไปปรับใช้ในการปฏิบัติงานจริงของหน่วยงาน จะต้องได้รับความเห็นชอบและการอนุมัติตามระเบียบราชการ
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <strong className="text-slate-900 font-bold block">
                6. มาตรการรักษาความปลอดภัยและสิทธิ์ผู้ใช้
              </strong>
              <p className="text-slate-600 leading-relaxed">
                หากนำไปพัฒนาต่อยอดในระดับปฏิบัติงานจริง จะต้องติดตั้งระบบการพิสูจน์ตัวตน (Authentication) การแบ่งสิทธิ์ (RBAC) และการเข้ารหัสข้อมูลที่รัดกุม
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 md:col-span-2">
              <strong className="text-slate-900 font-bold block">
                7. การปฏิบัติตามระเบียบและกฎหมาย
              </strong>
              <p className="text-slate-600 leading-relaxed">
                การดำเนินงานทุกขั้นตอนต้องปฏิบัติตามพระราชบัญญัติข้อมูลข่าวสารของราชการ ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ และระเบียบว่าด้วยการรักษาความลับของทางราชการ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Non-infringement Statement */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          ขอบเขตความปลอดภัยของระบบต้นแบบ (Prototype Safety Boundaries)
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          ระบบ SOTS เป็นระบบบริหารจัดการงานธุรการ (Administrative Task Management) เพื่อติดตามความก้าวหน้าของงานเอกสารและการประสานงานทั่วไปเท่านั้น
          ระบบนี้ไม่มีและจะไม่มีฟังก์ชันต่อไปนี้:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
          <li className="flex items-center gap-2">
            <span className="text-rose-500 font-bold">✕</span> ไม่มีการติดตามพิกัดตำแหน่งของบุคคล
          </li>
          <li className="flex items-center gap-2">
            <span className="text-rose-500 font-bold">✕</span> ไม่มีการจดจำใบหน้า (Facial Recognition)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-rose-500 font-bold">✕</span> ไม่มีการประเมินหรือจัดอันดับความเสี่ยงบุคคล
          </li>
          <li className="flex items-center gap-2">
            <span className="text-rose-500 font-bold">✕</span> ไม่มีฐานข้อมูลผู้ต้องสงสัยหรือคดีความ
          </li>
          <li className="flex items-center gap-2">
            <span className="text-rose-500 font-bold">✕</span> ไม่มีระบบข่าวกรองหรือการเฝ้าระวัง
          </li>
          <li className="flex items-center gap-2">
            <span className="text-rose-500 font-bold">✕</span> ไม่มีการเชื่อมต่อฐานข้อมูลภายนอกที่ไม่ได้รับอนุญาต
          </li>
        </ul>
      </div>

      {/* Institutional Credit */}
      <div className="bg-slate-900 text-white rounded-xl p-6 text-xs space-y-3">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="font-bold text-sm">ข้อมูลโครงงานสหกิจศึกษา (CWIE Project Info)</h3>
            <p className="text-slate-300">มหาวิทยาลัยทักษิณ ร่วมกับ ที่ทำการปกครองจังหวัดสงขลา กลุ่มงานความมั่นคง</p>
          </div>
        </div>
        <p className="text-slate-400 leading-relaxed">
          โครงงานนี้มุ่งเน้นการศึกษาปัญหาการติดตามงานคั่งค้าง และทดลองออกแบบนวัตกรรมการบริหารงานภาครัฐดิจิทัล (GovTech)
          เพื่อตอบสนองการบริการประชาชนและการบริหารราชการที่มีประสิทธิภาพ โปร่งใส และตรวจสอบได้
        </p>
      </div>
    </div>
  );
};

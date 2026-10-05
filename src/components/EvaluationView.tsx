import React, { useState } from 'react';
import { EvaluationItem } from '../types';
import {
  Star,
  CheckCircle2,
  FileCheck,
  Send,
  MessageSquare,
  Award,
  Sparkles,
  Info
} from 'lucide-react';

interface EvaluationViewProps {
  evaluations: EvaluationItem[];
  onSubmitEvaluation: (item: EvaluationItem) => void;
  onResetEvaluations?: () => void;
}

const CRITERIA = [
  { key: 'easeOfUse', label: '1. ความง่ายต่อการใช้งาน', desc: 'ความสะดวกในการเรียนรู้และใช้งานระบบโดยไม่ซับซ้อน' },
  { key: 'clarity', label: '2. ความชัดเจนของข้อมูล', desc: 'การแสดงผลรหัสงาน สถานะ วันที่ และความคืบหน้าชัดเจน' },
  { key: 'convenience', label: '3. ความสะดวกในการติดตามงาน', desc: 'ระบบแจ้งเตือนกำหนดเวลาและตัวกรองช่วยติดตามงานได้รวดเร็ว' },
  { key: 'layoutSuitability', label: '4. ความเหมาะสมของรูปแบบระบบ', desc: 'การออกแบบ UI สี ฟอนต์ และโครงสร้างหน้าจอเหมาะกับงานราชการ' },
  { key: 'operationalBenefit', label: '5. ประโยชน์ต่อการปฏิบัติงาน', desc: 'ช่วยลดการจดจำงานด้วยตนเองและเพิ่มประสิทธิภาพงานกลุ่มงาน' }
];

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  evaluations,
  onSubmitEvaluation,
  onResetEvaluations
}) => {
  // Form State
  const [evaluatorName, setEvaluatorName] = useState('');
  const [role, setRole] = useState('ผู้ทรงคุณวุฒิ / อาจารย์นิเทศก์');
  const [ratings, setRatings] = useState<Record<string, number>>({
    easeOfUse: 5,
    clarity: 5,
    convenience: 5,
    layoutSuitability: 5,
    operationalBenefit: 5
  });
  const [comments, setComments] = useState('');
  const [formError, setFormError] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Compute Averages
  const totalCount = evaluations.length;

  const avgScores = CRITERIA.reduce((acc, c) => {
    if (totalCount === 0) {
      acc[c.key] = 0;
      return acc;
    }
    const sum = evaluations.reduce((s, item) => s + (item.ratings as any)[c.key], 0);
    acc[c.key] = Number((sum / totalCount).toFixed(2));
    return acc;
  }, {} as Record<string, number>);

  const overallAvg =
    totalCount > 0
      ? Number(
          (
            Object.values(avgScores).reduce((a, b) => a + b, 0) / CRITERIA.length
          ).toFixed(2)
        )
      : 0;

  const getScoreInterpretation = (score: number) => {
    if (score >= 4.5) return { text: 'มากที่สุด (ดีเด่น)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 3.5) return { text: 'มาก (ดี)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (score >= 2.5) return { text: 'ปานกลาง', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { text: 'ควรปรับปรุง', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!evaluatorName.trim()) {
      setFormError('กรุณากรอกชื่อผู้ประเมินเพื่อบันทึกผลการทดสอบ');
      return;
    }

    const newItem: EvaluationItem = {
      id: `EV-${String(evaluations.length + 1).padStart(3, '0')}`,
      evaluatorName: evaluatorName.trim(),
      role: role.trim(),
      date: new Date().toISOString().slice(0, 10),
      ratings: {
        easeOfUse: ratings.easeOfUse,
        clarity: ratings.clarity,
        convenience: ratings.convenience,
        layoutSuitability: ratings.layoutSuitability,
        operationalBenefit: ratings.operationalBenefit
      },
      comments: comments.trim()
    };

    onSubmitEvaluation(newItem);
    setSubmittedSuccess(true);
    setFormError('');
    setComments('');
    setEvaluatorName('');
    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              ส่วนประเมินผลโครงงานพัฒนางาน CWIE มหาวิทยาลัยทักษิณ
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              การประเมินการใช้งานระบบ (Prototype Evaluation)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              แบบประเมินความพึงพอใจและประสิทธิภาพการใช้งานสำหรับใช้ประกอบรายงานผลการปฏิบัติงานสหกิจศึกษา
            </p>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-xl text-center min-w-[160px]">
            <span className="text-[11px] text-slate-300 block uppercase font-bold tracking-wider">
              คะแนนเฉลี่ยรวม
            </span>
            <div className="text-3xl font-bold text-blue-400 font-mono mt-0.5">
              {overallAvg} <span className="text-sm font-normal text-slate-400">/ 5.00</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-1 font-medium">
              จากผู้ประเมิน {totalCount} ราย
            </div>
          </div>
        </div>

        {/* Disclaimer alert */}
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>หมายเหตุประกอบรายงาน CWIE:</strong> ข้อมูลคะแนนในหน้านี้เป็น{' '}
            <u>ข้อมูลการทดลอง/ข้อมูลจำลอง</u> เพื่อแสดงตัวอย่างการวิเคราะห์ผลสัมฤทธิ์ของระบบ
            จนกว่าจะมีการจัดเก็บข้อมูลแบบสอบถามจริงจากเจ้าหน้าที่ผู้ปฏิบัติงานและอาจารย์นิเทศก์
          </span>
        </div>
      </div>

      {/* Evaluation Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Criteria Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-900" />
            ผลการประเมินจำแนกตามรายด้าน (5 ข้อ)
          </h2>

          <div className="space-y-4 pt-2">
            {CRITERIA.map((criterion) => {
              const score = avgScores[criterion.key] || 0;
              const interp = getScoreInterpretation(score);
              const percentage = (score / 5) * 100;

              return (
                <div key={criterion.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{criterion.label}</span>
                    <span className="font-mono font-bold text-blue-900 text-sm">
                      {score.toFixed(2)} / 5.00
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{criterion.desc}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-900 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${interp.color}`}
                    >
                      {interp.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            เกณฑ์คะแนน: 5 = มากที่สุด, 4 = มาก, 3 = ปานกลาง, 2 = น้อย, 1 = น้อยที่สุด
          </div>
        </div>

        {/* Right: Interactive Evaluation Form */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            ทดลองทำแบบประเมิน (สำหรับอาจารย์ / ผู้ทดสอบระบบ)
          </h2>

          {submittedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>บันทึกการประเมินทดลองเรียบร้อยแล้ว! คะแนนเฉลี่ยอัปเดตทันที</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อผู้ประเมิน / ตำแหน่งสมมติ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                placeholder="เช่น ผศ.ดร. ... (อาจารย์นิเทศก์) หรือ เจ้าหน้าที่ปกครองชำนาญการ"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                สถานะผู้ประเมิน
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
              >
                <option value="อาจารย์นิเทศก์ มหาวิทยาลัยทักษิณ">
                  อาจารย์นิเทศก์ มหาวิทยาลัยทักษิณ
                </option>
                <option value="หัวหน้างาน/ผู้ควบคุมการปฏิบัติงาน CWIE">
                  หัวหน้างาน/ผู้ควบคุมการปฏิบัติงาน CWIE
                </option>
                <option value="เจ้าหน้าที่ผู้ใช้งานระบบ">เจ้าหน้าที่ผู้ใช้งานระบบ</option>
                <option value="นักศึกษาสหกิจศึกษา CWIE">นักศึกษาสหกิจศึกษา CWIE</option>
                <option value="บุคคลทั่วไป/ผู้ทดสอบ">บุคคลทั่วไป/ผู้ทดสอบ</option>
              </select>
            </div>

            {/* 5 Rating Rows */}
            <div className="space-y-2.5 pt-1">
              {CRITERIA.map((criterion) => (
                <div
                  key={criterion.key}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="font-medium text-slate-700 max-w-[200px]">
                    {criterion.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() =>
                          setRatings({ ...ratings, [criterion.key]: num })
                        }
                        className={`w-7 h-7 text-xs font-bold rounded-md transition-all ${
                          ratings[criterion.key] === num
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ข้อเสนอแนะเพิ่มเติมสำหรับการปรับปรุงระบบ
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="ระบุข้อคิดเห็นเชิงสร้างสรรค์สำหรับการพัฒนาระบบในอนาคต..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                ⚠️ {formError}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              ส่งผลการประเมินทดสอบ
            </button>
          </form>
        </div>
      </div>

      {/* Evaluation Log / History */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-900" />
            รายการบันทึกผลการประเมินทดลอง ({evaluations.length} รายการ)
          </h2>
          {onResetEvaluations && (
            <button
              onClick={onResetEvaluations}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
            >
              รีเซ็ตแบบประเมินตัวอย่างเริ่มต้น
            </button>
          )}
        </div>

        <div className="space-y-3">
          {evaluations.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-slate-900">{ev.evaluatorName}</span>
                  <span className="text-slate-500 ml-2">({ev.role})</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                  <span>{ev.date}</span>
                  <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                    เฉลี่ย: {(
                      Object.values(ev.ratings).reduce((a, b) => a + b, 0) / 5
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {ev.comments && (
                <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-100">
                  “{ev.comments}”
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

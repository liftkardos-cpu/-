import React, { useState, useRef } from 'react';
import { TaskDocument, UserRole } from '../types';
import {
  FileText,
  FileSpreadsheet,
  File,
  Image,
  Paperclip,
  Upload,
  Download,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus,
  X,
  FolderClosed,
  User,
  Calendar
} from 'lucide-react';
import { formatThaiDate } from '../utils/dateUtils';
import { validateUploadFile, getFileCategoryIcon } from '../services/googleDrive';
import { getAccessToken } from '../services/googleAuth';
import { ConfirmModal } from './ConfirmModal';

export type DriveConnectionState =
  | 'connected'
  | 'disconnected'
  | 'uploading'
  | 'upload_success'
  | 'error';

interface TaskDocumentsSectionProps {
  taskId: string;
  documents: TaskDocument[];
  onUpload: (file: File, uploaderName: string) => Promise<void>;
  onDelete: (doc: TaskDocument) => Promise<void>;
  driveStatus: DriveConnectionState;
  driveErrorMessage?: string;
  userRole: UserRole;
  defaultUploader?: string;
}

export const TaskDocumentsSection: React.FC<TaskDocumentsSectionProps> = ({
  taskId,
  documents,
  onUpload,
  onDelete,
  driveStatus,
  driveErrorMessage,
  userRole,
  defaultUploader = 'เจ้าหน้าที่'
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaderName, setUploaderName] = useState(defaultUploader);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<TaskDocument | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canEdit = userRole === 'admin' || userRole === 'staff';

  // Filter documents for this task
  const taskDocs = documents.filter((d) => d.taskId === taskId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateUploadFile(file);
      if (!validation.valid) {
        setValidationError(validation.error || 'ไฟล์ไม่ถูกต้อง');
        setSelectedFile(null);
      } else {
        setValidationError(null);
        setSelectedFile(file);
      }
    }
  };

  const handleOpenUploadModal = () => {
    setSelectedFile(null);
    setValidationError(null);
    setUploaderName(defaultUploader);
    setIsUploadModalOpen(true);
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('กรุณาเลือกไฟล์ที่ต้องการอัปโหลด');
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpload(selectedFile, uploaderName.trim() || defaultUploader);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (err: any) {
      setValidationError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    const target = docToDelete;
    setDocToDelete(null);

    try {
      setDeletingDocId(target.id);
      await onDelete(target);
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleDownload = async (doc: TaskDocument) => {
    try {
      setIsDownloading(doc.id);
      if (doc.driveFileId && !doc.driveFileId.startsWith('demo-') && !doc.driveFileId.startsWith('local-')) {
        const token = await getAccessToken();
        if (token) {
          const res = await fetch(`https://www.googleapis.com/drive/v3/files/${doc.driveFileId}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return;
          }
        }
      }

      // Fallback: trigger download link or open
      const a = document.createElement('a');
      a.href = doc.driveUrl || '#';
      a.download = doc.fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.warn('Download error:', err);
    } finally {
      setIsDownloading(null);
    }
  };

  const renderFileIcon = (fileName: string) => {
    const type = getFileCategoryIcon(fileName);
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'xls':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'image':
        return <Image className="w-5 h-5 text-purple-600 shrink-0" />;
      default:
        return <File className="w-5 h-5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
      {/* Header with Title and Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-900 rounded-lg">
            <Paperclip className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              เอกสารประกอบงาน ({taskDocs.length} รายการ)
            </h3>
            <p className="text-[11px] text-slate-500">
              จัดเก็บในโฟลเดอร์ Google Drive: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-950 font-mono text-[10px]">SOTS_Documents/{taskId}/</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
          {driveStatus === 'connected' && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              ● Google Drive เชื่อมต่อแล้ว
            </span>
          )}
          {driveStatus === 'disconnected' && (
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              ○ ยังไม่ได้เชื่อมต่อ
            </span>
          )}
          {driveStatus === 'uploading' && (
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
              ↻ กำลังอัปโหลด
            </span>
          )}
          {driveStatus === 'upload_success' && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ✓ อัปโหลดสำเร็จ
            </span>
          )}
          {driveStatus === 'error' && (
            <span
              className="text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
              title={driveErrorMessage}
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              ⚠ เกิดข้อผิดพลาด
            </span>
          )}

          {/* Add Document Button */}
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenUploadModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ เพิ่มเอกสาร</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Form Modal / Drawer */}
      {isUploadModalOpen && (
        <form
          onSubmit={handleSubmitUpload}
          className="p-4 bg-slate-50 border border-blue-200 rounded-xl space-y-3.5 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-900" />
              <span className="text-xs font-bold text-slate-800">
                อัปโหลดเอกสารประกอบงาน ({taskId})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* File selection */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                เลือกไฟล์เอกสาร <span className="text-rose-500">*</span>:
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-900 hover:file:bg-blue-200 cursor-pointer border border-slate-300 rounded-lg bg-white p-1"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                รองรับ PDF, Word, Excel, PowerPoint, รูปภาพ (สูงสุด 15 MB)
              </p>
            </div>

            {/* Uploader Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ผู้ที่อัปโหลด:
              </label>
              <input
                type="text"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                placeholder="ระบุชื่อเจ้าหน้าที่ผู้ดำเนินการ"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
                required
              />
            </div>
          </div>

          {selectedFile && (
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                {renderFileIcon(selectedFile.name)}
                <div>
                  <div className="font-semibold text-slate-800">{selectedFile.name}</div>
                  <div className="text-[11px] text-slate-500">
                    ขนาด: {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-medium">
                พร้อมอัปโหลด
              </span>
            </div>
          )}

          {validationError && (
            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              {driveStatus === 'connected'
                ? 'ไฟล์จะถูกอัปโหลดขึ้น Google Drive และบันทึก metadata ลง Sheet "Documents"'
                : 'Google Drive ยังไม่ได้เชื่อมต่อ — จะบันทึกไฟล์จำลองในเครื่อง'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังอัปโหลด...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>เริ่มอัปโหลด</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Document Table / List */}
      {taskDocs.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <FolderClosed className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <h4 className="text-xs font-bold text-slate-700">
            ยังไม่มีเอกสารแนบสำหรับงานรหัส {taskId}
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
            เอกสารที่อัปโหลดจะถูกแยกเก็บตามรหัสงานใน Google Drive ภายใต้โฟลเดอร์{' '}
            <code className="bg-slate-200/80 px-1 py-0.5 rounded font-mono">
              SOTS_Documents/{taskId}/
            </code>
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenUploadModal}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มเอกสารตอนนี้</span>
            </button>
          )}
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">ชื่อไฟล์</th>
                  <th className="py-2.5 px-3 font-semibold">ประเภทไฟล์</th>
                  <th className="py-2.5 px-3 font-semibold">ขนาดไฟล์</th>
                  <th className="py-2.5 px-3 font-semibold">วันที่อัปโหลด</th>
                  <th className="py-2.5 px-3 font-semibold">ผู้ที่อัปโหลด</th>
                  <th className="py-2.5 px-3 font-semibold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {taskDocs.map((doc) => {
                  const isDeleting = deletingDocId === doc.id;
                  const isRealDrive = doc.driveUrl && !doc.driveUrl.startsWith('blob:');

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      {/* File Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 min-w-[180px]">
                          {renderFileIcon(doc.fileName)}
                          <div>
                            <div className="font-semibold text-slate-800 leading-tight">
                              {doc.fileName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {doc.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* File Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {doc.fileName.split('.').pop()?.toUpperCase() || doc.fileType}
                        </span>
                      </td>

                      {/* File Size */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                        {doc.fileSize}
                      </td>

                      {/* Uploaded Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatThaiDate(doc.uploadedDate)}</span>
                        </div>
                      </td>

                      {/* Uploaded By */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium text-[11px]">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{doc.uploadedBy}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Open / View */}
                          <a
                            href={doc.driveUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded transition-colors cursor-pointer"
                            title={isRealDrive ? 'เปิดดูใน Google Drive' : 'เปิดดูเอกสาร'}
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>เปิดดู</span>
                          </a>

                          {/* Download */}
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            disabled={isDownloading === doc.id}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2 py-1 rounded transition-colors cursor-pointer disabled:opacity-50"
                            title="ดาวน์โหลดไฟล์"
                          >
                            {isDownloading === doc.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-blue-900" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            <span>ดาวน์โหลด</span>
                          </button>

                          {/* Delete */}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => setDocToDelete(doc)}
                              disabled={isDeleting}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded transition-colors cursor-pointer disabled:opacity-50"
                              title="ลบเอกสาร"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              <span>ลบ</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <ConfirmModal
          isOpen={Boolean(docToDelete)}
          title="ยืนยันการลบเอกสารประกอบงาน"
          message={`คุณต้องการลบเอกสาร "${docToDelete.fileName}" ออกจากระบบหรือไม่? ระบบจะลบไฟล์ออกจาก Google Drive (โฟลเดอร์ SOTS_Documents/${taskId}/) และลบข้อมูลออกจาก Google Sheets แผ่นงาน Documents ทันที`}
          confirmText="ลบเอกสาร"
          cancelText="ยกเลิก"
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDocToDelete(null)}
        />
      )}
    </div>
  );
};

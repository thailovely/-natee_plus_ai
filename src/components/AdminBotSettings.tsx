import React, { useState, useEffect } from 'react';
import { Bot, Save, FileText, Upload, Trash2, CheckCircle2, AlertCircle, RefreshCw, Send, Sparkles, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { CuteRobotAvatar } from './NateeBotWidget';

interface AdminBotSettingsProps {
  currentUser: any;
  showNotif: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminBotSettings: React.FC<AdminBotSettingsProps> = ({ currentUser, showNotif }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Form State
  const [enabled, setEnabled] = useState(true);
  const [botName, setBotName] = useState("Natee bot");
  const [greetingMsg, setGreetingMsg] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [knowledgeBaseText, setKnowledgeBaseText] = useState("");
  const [knowledgeFiles, setKnowledgeFiles] = useState<any[]>([]);
  const [quickQuestionsText, setQuickQuestionsText] = useState("");

  // Test Chat state
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<{ sender: 'user' | 'bot'; text: string; time: string }[]>([]);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchBotSettings();
  }, []);

  const fetchBotSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/bot-config');
      const data = await res.json();
      if (data.success && data.botConfig) {
        const c = data.botConfig;
        setEnabled(c.enabled ?? true);
        setBotName(c.botName || "Natee bot");
        setGreetingMsg(c.greetingMsg || "สวัสดีค่ะ! หนูคือ Natee bot ผู้ช่วยประจำระบบ Natee Plus Market ยินดีให้คำแนะนำและตอบทุกข้อสงสัยเกี่ยวกับระบบค่ะ 🤖✨");
        setSystemPrompt(c.systemPrompt || "");
        setKnowledgeBaseText(c.knowledgeBaseText || "");
        setKnowledgeFiles(c.knowledgeFiles || []);
        if (c.quickQuestions && Array.isArray(c.quickQuestions)) {
          setQuickQuestionsText(c.quickQuestions.join('\n'));
        } else {
          setQuickQuestionsText("นที พลัส มาร์เก็ต คืออะไร?\nวิธีสมัครแพ็กเกจ และคะแนน PV\nวิธีเปิดร้านค้าขายของในระบบ\nการฝากเงิน ถอนเงิน และสิทธิ์คงเหลือ");
        }
      }
    } catch (err) {
      console.error("Error fetching bot settings:", err);
      showNotif("ไม่สามารถดึงข้อมูลการตั้งค่า AI Bot ได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const questionsArray = quickQuestionsText
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      const res = await fetch('/api/admin/bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          botName,
          greetingMsg,
          systemPrompt,
          knowledgeBaseText,
          quickQuestions: questionsArray,
          editorUserId: currentUser?.userId || 'admin'
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotif("✓ บันทึกข้อมูลการตั้งค่า AI Chatbot เรียบร้อยแล้วค่ะ", "success");
      } else {
        showNotif(data.message || "เกิดข้อผิดพลาดในการบันทึก", "error");
      }
    } catch (err) {
      console.error("Save bot error:", err);
      showNotif("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showNotif("กรุณาเลือกไฟล์เอกสารประเภท .PDF เท่านั้นค่ะ", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotif("ขนาดไฟล์ PDF ต้องไม่เกิน 10MB ค่ะ", "error");
      return;
    }

    setUploadingPdf(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Pdf = reader.result as string;
      try {
        const res = await fetch('/api/admin/upload-bot-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfFile: base64Pdf,
            fileName: file.name,
            editorUserId: currentUser?.userId || 'admin'
          })
        });

        const data = await res.json();
        if (data.success) {
          showNotif(data.message, "success");
          if (data.botConfig) {
            setKnowledgeBaseText(data.botConfig.knowledgeBaseText || "");
            setKnowledgeFiles(data.botConfig.knowledgeFiles || []);
          }
        } else {
          showNotif(data.message || "เกิดข้อผิดพลาดในการอ่านไฟล์ PDF", "error");
        }
      } catch (err) {
        console.error("PDF Upload Error:", err);
        showNotif("เกิดข้อผิดพลาดในการส่งไฟล์ PDF ขึ้นระบบ", "error");
      } finally {
        setUploadingPdf(false);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTestSend = async () => {
    if (!testInput.trim() || testLoading) return;

    const userText = testInput.trim();
    setTestMessages(prev => [...prev, {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    }]);
    setTestInput("");
    setTestLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      if (data.success) {
        setTestMessages(prev => [...prev, {
          sender: 'bot',
          text: data.reply || "ตอบรับการทดสอบเรียบร้อยค่ะ",
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setTestMessages(prev => [...prev, {
          sender: 'bot',
          text: data.reply || data.message || "เกิดข้อผิดพลาดในการประมวลผลคำตอบ",
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      setTestMessages(prev => [...prev, {
        sender: 'bot',
        text: "ขัดข้อง ไม่สามารถทดสอบได้ในขณะนี้",
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-600 mb-2" />
        <p className="text-sm">กำลังโหลดข้อมูลการตั้งค่า AI Chatbot...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CuteRobotAvatar size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xl text-cyan-200">🤖 ตั้งค่า AI Chatbot ผู้ช่วยประจำระบบ</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              จัดการชื่อ คำทักทาย กำหนดกฎเหล็กขอบเขตการตอบคำถาม และอัปโหลดเอกสาร PDF เพื่อเพิ่มเติมความรู้ให้ AI ตอบเฉพาะข้อมูลระบบ Natee Plus Market ได้อย่างแม่นยำ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Config Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Main Status & General Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                <h4 className="font-extrabold text-slate-800 text-sm">1. ข้อมูลทั่วไปและการเปิดใช้งานระบบ</h4>
              </div>
              
              {/* Toggle Enable */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2.5 text-xs font-bold text-slate-700">
                  {enabled ? 'เปิดใช้งาน Bot' : 'ปิดใช้งาน Bot'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ Bot สัญลักษณ์ผู้ช่วย</label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="เช่น น้องนที AI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">คำถามแนะนำด่วน (พิมพ์แยกบรรทัด)</label>
                <textarea
                  rows={2}
                  value={quickQuestionsText}
                  onChange={(e) => setQuickQuestionsText(e.target.value)}
                  placeholder="พิมพ์คำถามละ 1 บรรทัด"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ข้อความทักทายแรกเมื่อกดเปิด Chat</label>
              <textarea
                rows={2}
                value={greetingMsg}
                onChange={(e) => setGreetingMsg(e.target.value)}
                placeholder="ข้อความต้อนรับ..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Card 2: Knowledge Base & PDF File Upload */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-600" />
                <h4 className="font-extrabold text-slate-800 text-sm">2. คลังความรู้เอกสารระบบ (Knowledge Base & PDF)</h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {knowledgeBaseText ? `ความรู้สะสม ${knowledgeBaseText.length.toLocaleString()} ตัวอักษร` : 'ยังไม่มีคลังความรู้เพิ่มเติม'}
              </span>
            </div>

            {/* Upload PDF Box */}
            <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border-2 border-dashed border-cyan-300 rounded-2xl p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-cyan-700 font-bold text-xs">
                <Upload className="w-5 h-5 text-cyan-600" />
                <span>นำเข้าไฟล์เอกสารคู่มือระบบประเภท .PDF (สแกนอ่านข้อความอัตโนมัติ)</span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                อัปโหลดไฟล์ PDF เช่น คู่มือแผนรายได้, กฎระเบียบผู้ขาย, เอกสารสินค้า เพื่อให้ AI สแกนดึงข้อความเก็บไว้ในคลังความรู้ทันที
              </p>
              
              <div className="pt-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer shadow-md transition">
                  <FileText className="w-4 h-4" />
                  {uploadingPdf ? 'กำลังอ่านและประมวลผล PDF...' : 'เลือกไฟล์ PDF จากเครื่อง'}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={uploadingPdf}
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* List of Uploaded PDF Files */}
            {knowledgeFiles && knowledgeFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  รายการไฟล์ PDF ที่ประมวลผลความรู้แล้ว ({knowledgeFiles.length} ไฟล์):
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {knowledgeFiles.map((f: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-slate-800 truncate">{f.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {f.textLength ? `${f.textLength.toLocaleString()} ตัวอักษร` : 'อ่านสมบูรณ์'} • {new Date(f.uploadedAt).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 shrink-0">
                        พร้อมใช้งาน
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Base Text Editor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">เนื้อหาคลังความรู้เอกสารระบบ (Knowledge Base Content)</label>
                {knowledgeBaseText && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างคลังความรู้เอกสารทั้งหมด?")) {
                        setKnowledgeBaseText("");
                        setKnowledgeFiles([]);
                      }
                    }}
                    className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ล้างคลังความรู้
                  </button>
                )}
              </div>
              <textarea
                rows={6}
                value={knowledgeBaseText}
                onChange={(e) => setKnowledgeBaseText(e.target.value)}
                placeholder="ข้อความความรู้ของระบบจะถูกเพิ่มอัตโนมัติจากการอัปโหลด PDF หรือคุณสามารถพิมพ์/แก้ไขเพิ่มได้เองที่นี่..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 custom-scrollbar"
              />
            </div>
          </div>

          {/* Card 3: Custom System Prompt Instructions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h4 className="font-extrabold text-slate-800 text-sm">3. กำหนดคำสั่งพิเศษ / ขอบเขตการตอบ (System Instructions)</h4>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">กฎการควบคุมขอบเขต (System Scope Guardrails):</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  ระบบได้ตั้งค่าขอบเขตตั้งต้นให้ Bot ตอบเฉพาะข้อมูล Natee Plus Market เท่านั้น โดยปฏิเสธเรื่องการเมือง ศาสนา เรื่องทั่วไป หรือการวิพากษ์วิจารณ์คู่แข่งโดยอัตโนมัติ คุณสามารถเพิ่มกฎพิเศษเฉพาะองค์กรเพิ่มเติมด้านล่างได้
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">คำสั่งและขอบเขตเพิ่มเติมสำหรับ Admin (Custom System Prompt)</label>
              <textarea
                rows={4}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="เช่น: ให้เน้นย้ำเรื่องโปรโมชั่นประจำเดือน, ห้ามพูดถึงการคืนเงินนอกระบบ, ให้คำแนะนำสุภาพเสมอ..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Live Interactive Test Chat Console (1 Col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-cyan-500/30 p-4 text-white shadow-xl flex flex-col h-[650px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CuteRobotAvatar size="sm" />
                <div>
                  <h4 className="font-extrabold text-sm text-cyan-200">ทดสอบสนทนากับ {botName}</h4>
                  <p className="text-[10px] text-slate-400">ทดสอบคำตอบตามคลังความรู้ล่าสุด</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestMessages([])}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition"
                title="ล้างแชททดสอบ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Test Chat Messages */}
            <div className="flex-1 my-3 overflow-y-auto space-y-3 custom-scrollbar text-xs pr-1">
              {testMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <Bot className="w-10 h-10 text-cyan-500/40 animate-pulse" />
                  <p className="text-xs text-slate-300 font-bold">พิมพ์ทดสอบคำถามด้านล่าง</p>
                  <p className="text-[10px] text-slate-500">
                    เช่น "วิธีสมัครแพ็กเกจ", "เปิดร้านค้าทำอย่างไร", "เรื่องการเมืองคิดอย่างไร" เพื่อดูการปฏิเสธอย่างสุภาพ
                  </p>
                </div>
              ) : (
                testMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${
                      m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {m.sender === 'bot' && <CuteRobotAvatar size="sm" className="shrink-0 mt-0.5" />}
                    <div
                      className={`max-w-[85%] rounded-2xl p-2.5 text-xs ${
                        m.sender === 'user'
                          ? 'bg-cyan-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block text-right">{m.time}</span>
                    </div>
                  </div>
                ))
              )}

              {testLoading && (
                <div className="flex items-center gap-2">
                  <CuteRobotAvatar size="sm" className="shrink-0" />
                  <div className="bg-slate-800 p-2.5 rounded-2xl rounded-tl-none text-xs text-cyan-300 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>น้องนทีกำลังประมวลผลคำตอบ...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Test Chat Input */}
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTestSend();
                  }
                }}
                placeholder="พิมพ์ทดสอบคำถาม..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleTestSend}
                disabled={!testInput.trim() || testLoading}
                className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl disabled:opacity-40 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

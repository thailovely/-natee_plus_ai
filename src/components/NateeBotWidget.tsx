import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, Trash2, ChevronDown, BookOpen, ShieldAlert, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isMock?: boolean;
}

interface NateeBotWidgetProps {
  currentUser?: any;
}

export const CuteRobotAvatar = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) => {
  const dimensions = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-11 h-11",
    xl: "w-14 h-14"
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${dimensions} ${className}`}>
      {/* Robot Face SVG directly - no heavy circular/square background box */}
      <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)] overflow-visible">
        {/* Antenna Stem & Glowing Tip */}
        <line x1="50" y1="28" x2="50" y2="12" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="50" cy="10" r="5.5" fill="#22d3ee" className="animate-pulse" />
        
        {/* Ears */}
        <rect x="6" y="44" width="10" height="20" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
        <rect x="84" y="44" width="10" height="20" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
        
        {/* Robot Head Frame */}
        <rect x="14" y="26" width="72" height="58" rx="18" fill="#0f172a" stroke="#38bdf8" strokeWidth="4" />
        
        {/* Screen/Face Area */}
        <rect x="22" y="34" width="56" height="42" rx="12" fill="#0369a1" fillOpacity="0.35" stroke="#0284c7" strokeWidth="2" />
        
        {/* Glowing Eyes */}
        <circle cx="38" cy="50" r="6.5" fill="#38bdf8" />
        <circle cx="39" cy="48.5" r="2" fill="#ffffff" />
        <circle cx="62" cy="50" r="6.5" fill="#38bdf8" />
        <circle cx="63" cy="48.5" r="2" fill="#ffffff" />
        
        {/* Cute Smile Mouth */}
        <path d="M 40 63 Q 50 70 60 63" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
        
        {/* Cute Rosy Cheeks */}
        <circle cx="29" cy="58" r="3.5" fill="#f43f5e" fillOpacity="0.75" />
        <circle cx="71" cy="58" r="3.5" fill="#f43f5e" fillOpacity="0.75" />
      </svg>
    </div>
  );
};

export const NateeBotWidget: React.FC<NateeBotWidgetProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [botConfig, setBotConfig] = useState<any>({
    enabled: true,
    botName: "Natee bot",
    greetingMsg: "สวัสดีค่ะ! หนูคือ Natee bot ผู้ช่วยประจำระบบ Natee Plus Market ยินดีให้คำแนะนำและตอบทุกข้อสงสัยเกี่ยวกับระบบค่ะ 🤖✨",
    quickQuestions: [
      "นที พลัส มาร์เก็ต คืออะไร?",
      "วิธีสมัครแพ็กเกจ และคะแนน PV",
      "วิธีเปิดร้านค้าขายของในระบบ",
      "การฝากเงิน ถอนเงิน และสิทธิ์คงเหลือ"
    ]
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch Bot Config on mount
    fetch('/api/ai/bot-config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.botConfig) {
          setBotConfig(data.botConfig);
          // Set initial greeting message
          setMessages([
            {
              id: 'init_1',
              sender: 'bot',
              text: data.botConfig.greetingMsg || "สวัสดีค่ะ! หนูคือ Natee bot ผู้ช่วยประจำระบบ Natee Plus Market ยินดีให้คำแนะนำและตอบทุกข้อสงสัยเกี่ยวกับระบบค่ะ 🤖✨",
              timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      })
      .catch(err => console.error("Error fetching bot config:", err));
  }, []);

  useEffect(() => {
    // Auto hide tooltip popup after 5 seconds
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customText) setInputMsg("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend.trim() })
      });

      const data = await res.json();
      if (data.success) {
        const botMessage: ChatMessage = {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: data.reply || "Natee bot ได้รับข้อความแล้วค่ะ",
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          isMock: data.isMock
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        setMessages(prev => [...prev, {
          id: 'err_' + Date.now(),
          sender: 'bot',
          text: data.reply || data.message || "Natee bot ต้องขออภัยด้วยนะคะ เกิดข้อผิดพลาดชั่วคราว กรุณาลองสอบถามใหม่อีกครั้งค่ะ",
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [...prev, {
        id: 'err_' + Date.now(),
        sender: 'bot',
        text: "ไม่สามารถเชื่อมต่อกับ Natee bot ได้ในขณะนี้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้งนะคะ",
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (botConfig.enabled === false) {
    return null; // Hidden if disabled by admin
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 md:right-6 z-[99999] font-sans antialiased">
      {/* Tooltip Popup when collapsed */}
      {!isOpen && showTooltip && (
        <div className="absolute bottom-16 right-0 mb-2 w-64 bg-slate-900/95 text-white text-xs rounded-2xl p-3 shadow-2xl border border-cyan-500/30 backdrop-blur-md animate-bounce">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
            className="absolute top-1.5 right-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-2.5">
            <CuteRobotAvatar size="sm" />
            <div>
              <p className="font-bold text-cyan-300">{botConfig.botName || "Natee bot"}</p>
              <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                มีข้อสงสัยเกี่ยวกับระบบ Natee Plus สอบถามหนูได้ตลอด 24 ชม. นะคะ 🤖✨
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          className="group relative flex items-center justify-center p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 text-white shadow-2xl shadow-cyan-600/40 hover:scale-105 active:scale-95 transition duration-200 cursor-pointer border border-cyan-300/40"
          title={botConfig.botName || "Natee bot"}
        >
          <CuteRobotAvatar size="md" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-slate-900"></span>
          </span>
        </button>
      )}

      {/* Chat Box Modal Drawer */}
      {isOpen && (
        <div className="w-[calc(100vw-24px)] max-w-[380px] sm:w-[400px] h-[78vh] sm:h-[520px] max-h-[600px] bg-slate-900/95 text-slate-100 rounded-3xl shadow-2xl border border-cyan-500/30 backdrop-blur-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-cyan-950 to-indigo-950 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CuteRobotAvatar size="md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-cyan-200">{botConfig.botName || "Natee bot"}</h4>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    พร้อมตอบ
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">ผู้ช่วยอัจฉริยะประจำระบบ Natee Plus Market</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: 'init_' + Date.now(),
                      sender: 'bot',
                      text: botConfig.greetingMsg || "สวัสดีค่ะ! หนูคือ Natee bot ผู้ช่วยประจำระบบ Natee Plus Market ยินดีให้คำแนะนำและตอบทุกข้อสงสัยเกี่ยวกับระบบค่ะ 🤖✨",
                      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                title="ล้างการสนทนา"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scope Banner Notice */}
          <div className="px-3 py-1.5 bg-cyan-950/40 border-b border-cyan-500/10 flex items-center justify-between text-[10px] text-cyan-300">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-cyan-400" />
              ตอบเฉพาะข้อมูลระบบ Natee Plus Market เท่านั้น
            </span>
            <span className="text-slate-400">Gemini 2.5 Flash (Free Tier)</span>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {msg.sender === 'bot' && (
                  <CuteRobotAvatar size="sm" className="mt-0.5 shrink-0" />
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-[12.5px]">{msg.text}</p>
                  <div className={`mt-1 text-[9px] flex items-center gap-1 ${msg.sender === 'user' ? 'text-cyan-200 justify-end' : 'text-slate-400'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.isMock && <span className="text-amber-400">(โหมดออฟไลน์)</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2.5">
                <CuteRobotAvatar size="sm" className="shrink-0" />
                <div className="bg-slate-800 border border-slate-700/60 rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-cyan-300 ml-1">Natee bot รวบรวมข้อมูล...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {botConfig.quickQuestions && botConfig.quickQuestions.length > 0 && (
            <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap space-x-1.5 custom-scrollbar">
              <span className="text-[10px] text-cyan-400 font-semibold mr-1">ถามด่วน:</span>
              {botConfig.quickQuestions.map((q: string, idx: number) => (
                <button
                  key={idx}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(q)}
                  className="inline-block px-2.5 py-1 rounded-full text-[10.5px] bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-200 text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="พิมพ์คำถามเกี่ยวกับระบบ Natee Plus..."
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMsg.trim() || isLoading}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:opacity-90 disabled:opacity-40 transition cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { 
  Mic, Languages, Loader2, Volume2, Zap, Heart, 
  Download, Activity, ShieldCheck, Play, Save,
  CheckCircle2, AlertCircle, Headphones, Radio, Sparkles,
  Smartphone, Monitor, Share2, Copy, User, Users, ChevronRight,
  PenTool, Music, FileAudio, ClipboardCheck, Baby
} from 'lucide-react';

/**
 * Queens AI Voice Studio - Ultimate Master Edition (v75.1)
 * ------------------------------------------------------
 * 퀸즈님만을 위한 12인 성우진 및 MP3/WAV 선택 저장 기능이 탑재된 최종 버전입니다.
 */

const getApiKey = () => {
  try {
    // Vercel 환경 변수 VITE_GEMINI_API_KEY 연동
    // @ts-ignore
    return import.meta.env.VITE_GEMINI_API_KEY || "";
  } catch (e) {
    return ""; 
  }
};
const apiKey = getApiKey();

export default function App() {
  const [inputText, setInputText] = useState("퀸즈미라클의 기적은 상상이 아니라 실행에서 시작됩니다.");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [status, setStatus] = useState("ready");
  const [targetLang, setTargetLang] = useState("Chinese");
  const [selectedVoice, setSelectedVoice] = useState("Puck"); 
  const [fileFormat, setFileFormat] = useState("WAV"); 
  const [copied, setCopied] = useState(false);

  // 12인 프리미엄 보이스 라인업
  const voices = [
    { id: "Puck", name: "동화", meta: "아이/어린이", desc: "귀엽고 경쾌한 아이 톤", icon: <Baby className="w-3.5 h-3.5 text-yellow-400" /> },
    { id: "Despina", name: "지아", meta: "10대 소녀", desc: "발랄하고 가벼운 목소리", icon: <User className="w-3.5 h-3.5 text-pink-300" /> },
    { id: "Aoede", name: "하나", meta: "20대 여성", desc: "밝고 감성적인 톤", icon: <User className="w-3.5 h-3.5 text-pink-500" /> },
    { id: "Kore", name: "코레", meta: "30대 여성", desc: "지적이고 명료한 비즈니스", icon: <User className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: "Callirrhoe", name: "윤아", meta: "우아한 여성", desc: "부드럽고 품격 있는 어조", icon: <User className="w-3.5 h-3.5 text-rose-400" /> },
    { id: "Leda", name: "리다", meta: "차분한 여성", desc: "우아하고 깊은 울림", icon: <User className="w-3.5 h-3.5 text-purple-400" /> },
    { id: "Autonoe", name: "노에", meta: "상냥한 여성", desc: "친절한 안내 및 상담", icon: <User className="w-3.5 h-3.5 text-orange-400" /> },
    { id: "Zephyr", name: "제피르", meta: "청년 남성", desc: "트렌디하고 에너제틱", icon: <User className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: "Fenrir", name: "펜릴", meta: "30대 남성", desc: "안정적인 나레이션", icon: <User className="w-3.5 h-3.5 text-slate-400" /> },
    { id: "Orus", name: "오러스", meta: "40대 남성", desc: "힘있고 자신감 넘치는 톤", icon: <User className="w-3.5 h-3.5 text-blue-400" /> },
    { id: "Enceladus", name: "진우", meta: "차분한 남성", desc: "따뜻하고 편안한 목소리", icon: <User className="w-3.5 h-3.5 text-teal-400" /> },
    { id: "Charon", name: "차론", meta: "50대 남성", desc: "낮고 중후한 신뢰감", icon: <User className="w-3.5 h-3.5 text-indigo-400" /> },
  ];

  const languages = [
    { id: "Chinese", name: "중국어" }, { id: "Tagalog", name: "필리핀어" },
    { id: "Hindi", name: "힌디어" }, { id: "Japanese", name: "일본어" },
    { id: "Indonesian", name: "인도네시아어" }, { id: "English", name: "영어" }
  ];

  const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return await response.json();
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw err;
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim() || !apiKey) return;
    setIsTranslating(true); setAudioUrl(null); setStatus("processing");
    try {
      const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `Translate to natural ${targetLang}: "${inputText}". System Instruction: Professional voice translator. Output ONLY the translated text without explanations.` }] }] })
      });
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (result) { setTranslatedText(result.replace(/^"|"$/g, '')); setStatus("ready"); }
    } catch (err) { setStatus("error"); } finally { setIsTranslating(false); }
  };

  const copyToClipboard = () => {
    if (!translatedText) return;
    const textArea = document.createElement("textarea");
    textArea.value = translatedText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  const generateSpeech = async () => {
    if (!translatedText || !apiKey) return;
    setIsGenerating(true); setStatus("processing");
    try {
      const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: translatedText }] }],
            generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } } }
          })
      });
      const audioData = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;
      if (audioData) {
        const pcmData = atob(audioData.data);
        const wavBlob = pcmToWav(pcmData, 24000);
        setAudioUrl(URL.createObjectURL(wavBlob));
        setStatus("success");
      }
    } catch (err) { setStatus("error"); } finally { setIsGenerating(false); }
  };

  const pcmToWav = (pcm, rate) => {
    const buffer = new ArrayBuffer(44 + pcm.length);
    const view = new DataView(buffer);
    const s = (o, str) => { for (let i = 0; i < str.length; i++) view.setUint8(o + i, str.charCodeAt(i)); };
    s(0, 'RIFF'); view.setUint32(4, 32 + pcm.length, true); s(8, 'WAVE'); s(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); s(36, 'data');
    view.setUint32(40, pcm.length, true);
    for (let i = 0; i < pcm.length; i++) view.setUint8(44 + i, pcm.charCodeAt(i));
    return new Blob([buffer], { type: fileFormat === "WAV" ? 'audio/wav' : 'audio/mpeg' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30">
      <div className="max-w-md mx-auto min-h-screen flex flex-col shadow-2xl bg-slate-950/50 border-x border-slate-900 relative pb-24">
        
        <header className="p-6 pt-10 flex flex-col gap-6 border-b border-slate-900 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-2.5 rounded-2xl shadow-xl animate-pulse"><Zap className="w-5 h-5 text-white fill-white" /></div>
              <div>
                <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none text-white">Queens AI</h1>
                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">Multi-Voice Master</p>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
              {status === 'processing' ? 'WORKING' : 'LIVE'}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {languages.map(lang => (
              <button key={lang.id} onClick={() => setTargetLang(lang.id)} className={`px-5 py-2.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all border ${targetLang === lang.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-105' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}>{lang.name}</button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-6 space-y-8 overflow-y-auto scrollbar-hide">
          <section className="space-y-4">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 flex items-center gap-2"><Users className="w-3 h-3" /> 1. Premium Actors (12 Voices)</label>
            <div className="grid grid-cols-2 gap-3">
              {voices.map(voice => (
                <button key={voice.id} onClick={() => setSelectedVoice(voice.id)} className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${selectedVoice === voice.id ? 'bg-indigo-600/10 border-indigo-500 shadow-xl' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}>
                  <div className="flex items-center justify-between mb-1 relative z-10"><span className={`text-xs font-black transition-colors ${selectedVoice === voice.id ? 'text-white' : 'text-slate-400'}`}>{voice.name}</span>{voice.icon}</div>
                  <p className="text-[9px] font-bold text-slate-500 relative z-10">{voice.meta}</p>
                </button>
              ))}
            </div>
          </section>
          
          <section className="space-y-3">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 flex items-center gap-2"><PenTool className="w-3 h-3" /> 2. Korean Script</label>
            <div className="relative group">
              <textarea className="w-full h-36 bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 text-lg font-medium focus:border-indigo-600 outline-none transition-all resize-none shadow-inner text-white leading-relaxed" placeholder="한국어 원고를 입력하세요..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
              <button onClick={handleTranslate} disabled={isTranslating || !inputText} className="absolute bottom-4 right-4 p-4 bg-indigo-600 rounded-2xl shadow-xl active:scale-90 transition-all disabled:opacity-50 hover:bg-indigo-500">{isTranslating ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Languages className="w-5 h-5 text-white" />}</button>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
               <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-3 h-3" /> 3. Clean Translation</label>
               {translatedText && <button onClick={copyToClipboard} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? 'COPIED' : 'COPY'}</button>}
            </div>
            <div className="w-full min-h-[100px] bg-emerald-950/5 border-2 border-emerald-900/20 rounded-3xl p-8 flex items-center justify-center text-center shadow-inner relative overflow-hidden">
              <p className="text-xl font-black text-emerald-50 leading-snug animate-in fade-in duration-500">{isTranslating ? "AI가 번역 중입니다..." : (translatedText || "번역 버튼을 눌러주세요.")}</p>
            </div>
          </section>

          <section className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2"><FileAudio className="w-3 h-3" /> 4. Select Audio Format</label>
            <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
               <button onClick={() => setFileFormat("WAV")} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${fileFormat === 'WAV' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>WAV (고음질)</button>
               <button onClick={() => setFileFormat("MP3")} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${fileFormat === 'MP3' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>MP3 (표준형)</button>
            </div>
          </section>

          <button onClick={generateSpeech} disabled={isGenerating || !translatedText} className="w-full py-7 rounded-[2.5rem] bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-900 text-white font-black text-2xl shadow-[0_20px_50px_rgba(79,70,229,0.35)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6 disabled:opacity-30 group">{isGenerating ? <Loader2 className="w-7 h-7 animate-spin text-white" /> : <Volume2 className="w-7 h-7 group-hover:scale-110 transition-transform" />}음성 추출 시작</button>

          {audioUrl && (
            <div className="pt-4 animate-in slide-in-from-bottom-5 duration-700">
              <div className="bg-black rounded-[3rem] border-2 border-indigo-900/40 p-8 shadow-2xl relative overflow-hidden group/player">
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/player:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                   <div className="flex gap-1.5 items-end h-10">{[0.5, 0.9, 0.3, 0.7, 1.0, 0.4, 0.8, 0.6].map((h, i) => (<div key={i} className="w-1.5 rounded-full animate-bounce bg-indigo-500" style={{height: `${h*100}%`, animationDelay: `${i*0.05}s`}}></div>))}</div>
                  <a href={audioUrl} download={`Queens_${selectedVoice}_${targetLang}.${fileFormat.toLowerCase()}`} className="bg-white text-black px-8 py-3.5 rounded-full font-black text-sm hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-3 shadow-2xl active:scale-95 group/save"><Download className="w-4 h-4 group-hover/save:animate-bounce" /> SAVE {fileFormat}</a>
                </div>
                <audio controls src={audioUrl} className="w-full custom-audio relative z-10" autoPlay />
              </div>
            </div>
          )}
        </main>

        <footer className="p-6 bg-slate-950 border-t border-slate-900 mt-auto flex items-center justify-around text-slate-600 fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[100] backdrop-blur-xl">
          <button className="flex flex-col items-center gap-1.5 text-indigo-500 group"><Zap className="w-5 h-5" /><span className="text-[8px] font-black uppercase tracking-widest">Studio</span></button>
          <button className="flex flex-col items-center gap-1.5 opacity-40 hover:text-slate-300 transition-colors"><Monitor className="w-5 h-5" /><span className="text-[8px] font-black uppercase tracking-widest">PC Sync</span></button>
          <button className="flex flex-col items-center gap-1.5 opacity-40 hover:text-slate-300 transition-colors"><Smartphone className="w-5 h-5" /><span className="text-[8px] font-black uppercase tracking-widest">App</span></button>
          <button className="flex flex-col items-center gap-1.5 opacity-40 hover:text-slate-300 transition-colors"><Heart className="w-5 h-5" /><span className="text-[8px] font-black uppercase tracking-widest">Legacy</span></button>
        </footer>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .custom-audio::-webkit-media-controls-panel { background-color: #000; height: 70px; padding: 0 20px; }
        .custom-audio::-webkit-media-controls-play-button { filter: invert(1) brightness(2) hue-rotate(240deg); transform: scale(1.8); margin-right: 20px; }
        .custom-audio::-webkit-media-controls-current-time-display,
        .custom-audio::-webkit-media-controls-time-remaining-display { color: #818cf8; font-family: 'JetBrains Mono', monospace; font-weight: 900; font-size: 14px; }
        .custom-audio::-webkit-media-controls-timeline { background-color: #1e293b; border-radius: 40px; height: 10px; }
      `}</style>
    </div>
  );
}

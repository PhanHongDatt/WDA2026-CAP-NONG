"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, SquareSquare, ArrowRight, Loader2, PlayCircle, SkipForward, RotateCcw, CheckCircle2, Volume2, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import { synthesizeSpeech, sendVoiceChatMessage, VoiceChatResponse, transcribeSpeech } from "@/services/api/voice";

// Fix Issue #13: Configurable TTS speaker voice instead of hardcoded value.
// Zalo AI TTS speaker IDs: 1 = Nam nữ (South women), 2 = Bắc nữ (Northern women),
//                           3 = Nam nam (South men),   4 = Bắc nam (Northern men)
const DEFAULT_TTS_SPEAKER_ID = 1;

export interface ConversationalVoiceResult {
  name: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  location?: string;
  harvestDate?: string;
  farmingMethod?: string;
  confidence: Record<string, number>;
  // Fix Issue #10: Add transcript so page.tsx can display what was said
  transcript: string;
}

interface ConversationalVoiceRecorderProps {
  onResult?: (data: ConversationalVoiceResult) => void;
  onCancel?: () => void;
}

type ConvoState = 
  | "idle"          // Chưa bắt đầu
  | "hello"         // Đang gửi câu chào
  | "speaking"      // AI đang nói (TTS)
  | "listening"     // Đang chờ user nói (STT)
  | "processing"    // Gửi BE chờ LLM response
  | "done"          // Đã xong
  | "error";

interface ChatMessage {
  role: "ai" | "user" | "advice";
  text: string;
  priceRange?: string;
}

// Flow các bước bắt buộc
const FLOW_STEPS = ["name", "price", "quantity", "location", "harvestDate", "farmingMethod", "description", "confirm"];
const STEP_LABELS: Record<string, string> = {
  name: "Tên nông sản",
  price: "Giá",
  quantity: "Sản lượng",
  location: "Nơi canh tác",
  harvestDate: "Ngày thu hoạch",
  farmingMethod: "Canh tác",
  description: "Mô tả",
  confirm: "Xác nhận",
};

export default function ConversationalVoiceRecorder({ onResult, onCancel }: ConversationalVoiceRecorderProps) {
  const [state, setState] = useState<ConvoState>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [collectedFields, setCollectedFields] = useState<Record<string, any>>({});
  const [confidences, setConfidences] = useState<Record<string, number>>({});
  
  const [interimText, setInterimText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  // Fix Issue #14: Track TTS loading and error states for user feedback
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsFallback, setTtsFallback] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Clean up audio resources
  const cleanupAudio = () => {
    if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    silenceTimerRef.current = null;
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // ── Ref mirrors to avoid stale closures in async callbacks (Issue #1, #2) ──
  const stateRef = useRef<ConvoState>(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const chatHistoryRef = useRef<ChatMessage[]>(chatHistory);
  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);

  const collectedFieldsRef = useRef<Record<string, any>>(collectedFields);
  useEffect(() => { collectedFieldsRef.current = collectedFields; }, [collectedFields]);

  const confidencesRef = useRef<Record<string, number>>(confidences);
  useEffect(() => { confidencesRef.current = confidences; }, [confidences]);

  const stepIndexRef = useRef(stepIndex);
  useEffect(() => { stepIndexRef.current = stepIndex; }, [stepIndex]);

  // Track consecutive silence count to avoid infinite re-prompt loops (Issue #3)
  const silenceCountRef = useRef(0);

  // Auto scroll to latest chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, interimText]);

  // Handle Speech Synthesis (Zalo AI)
  const speak = async (text: string) => {
    const fallbackToWebSpeech = () => {
      setTtsLoading(false);
      setTtsFallback(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";
      utterance.rate = 0.9;
      utterance.onend = () => {
        if (stateRef.current !== "done") startListening();
      };
      speechSynthesis.speak(utterance);
    };

    try {
      setState("speaking");
      setTtsLoading(true);
      setTtsFallback(false);
      if (audioUrl) URL.revokeObjectURL(audioUrl);

      const url = await synthesizeSpeech(text, DEFAULT_TTS_SPEAKER_ID);
      setTtsLoading(false);

      // Validate blob before playing — fetch it and check size
      try {
        const blobResp = await fetch(url);
        const blob = await blobResp.blob();
        if (blob.size < 100) {
          console.warn("TTS blob too small, falling back");
          URL.revokeObjectURL(url);
          fallbackToWebSpeech();
          return;
        }
      } catch {
        console.warn("TTS blob validation failed, falling back");
        URL.revokeObjectURL(url);
        fallbackToWebSpeech();
        return;
      }

      if (audioRef.current) {
        audioRef.current.src = url;
        try {
          await audioRef.current.play();
        } catch (playErr) {
          console.warn("Audio play failed, falling back", playErr);
          URL.revokeObjectURL(url);
          fallbackToWebSpeech();
          return;
        }
      }
      setAudioUrl(url);
    } catch (error) {
      console.error("TTS Failed", error);
      fallbackToWebSpeech();
    }
  };

  const handleAudioEnd = () => {
    // Fix Issue #2: Use ref to read the latest state value
    if (stateRef.current === "speaking") {
      startListening();
    }
  };

  const finishFlow = () => {
    setState("done");
    // Fix Issue #9: Clean up audio blob URL on finish
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (onResult) {
      // Use refs to avoid stale closures — finishFlow is called from within processTranscript
      // before React re-renders, so state variables would be stale.
      const fields = collectedFieldsRef.current;

      // Fix Issue #10: Build transcript from full conversation history
      const fullTranscript = chatHistoryRef.current
        .filter((m: ChatMessage) => m.role === "user")
        .map((m: ChatMessage) => m.text)
        .join(" | ");

      // Normalize harvestDate to YYYY-MM-DD
      let normalizedHarvestDate = fields.harvestDate || "";
      if (normalizedHarvestDate && !/^\d{4}-\d{2}-\d{2}$/.test(normalizedHarvestDate)) {
        const parsed = Date.parse(normalizedHarvestDate);
        if (!isNaN(parsed)) {
          const d = new Date(parsed);
          normalizedHarvestDate = d.toISOString().split("T")[0];
        } else {
          const isoMatch = normalizedHarvestDate.match(/(\d{4})-(\d{2})-(\d{2})/);
          const vnMatch = normalizedHarvestDate.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
          if (isoMatch) {
            normalizedHarvestDate = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
          } else if (vnMatch) {
            normalizedHarvestDate = `${vnMatch[3]}-${vnMatch[2].padStart(2, "0")}-${vnMatch[1].padStart(2, "0")}`;
          }
        }
      }

      // Normalize farmingMethod to expected ENUM
      let normalizedFarmingMethod = fields.farmingMethod || "";
      const fmUpper = normalizedFarmingMethod.toUpperCase();
      if (fmUpper.includes("ORGANIC") || fmUpper.includes("HỮU CƠ")) normalizedFarmingMethod = "ORGANIC";
      else if (fmUpper.includes("VIETGAP")) normalizedFarmingMethod = "VIETGAP";
      else if (fmUpper.includes("GLOBALGAP")) normalizedFarmingMethod = "GLOBALGAP";
      else if (fmUpper.includes("TRADITIONAL") || fmUpper.includes("TRUYỀN THỐNG") || fmUpper.includes("THƯỜNG")) normalizedFarmingMethod = "TRADITIONAL";

      onResult({
        name: fields.name || "",
        description: fields.description || "",
        price: fields.price || 0,
        unit: fields.quantity_unit || "KG",
        quantity: fields.quantity || 0,
        location: fields.location || "",
        harvestDate: normalizedHarvestDate,
        farmingMethod: normalizedFarmingMethod,
        confidence: confidencesRef.current,
        transcript: fullTranscript,
      });
    }
  };

  const processTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    
    // Fix Issue #1: Use ref to get the latest chatHistory, not the stale closure value.
    const newHistory = [...chatHistoryRef.current, { role: "user", text: transcript } as ChatMessage];
    setChatHistory(newHistory);
    setInterimText("");
    setState("processing");

    const currentField = FLOW_STEPS[stepIndexRef.current];
    if (currentField === "confirm") {
      try {
        const response: VoiceChatResponse = await sendVoiceChatMessage({
          current_field: "confirm",
          transcript,
          collected_fields: collectedFieldsRef.current,
          conversation_history: newHistory.filter(m => m.role !== "advice").map(m => ({ role: m.role as "ai" | "user", text: m.text })),
        });

        if (response.intent === "answer" && response.extracted_value === "yes") {
          finishFlow();
        } else if (response.intent === "correct" && response.correction_target) {
          // User wants to fix a specific field → jump to that field's step
          const targetIdx = FLOW_STEPS.indexOf(response.correction_target);
          if (targetIdx >= 0) {
            setStepIndex(targetIdx);
          }
          const msgs: ChatMessage[] = [{ role: "ai", text: response.next_question }];
          if (response.advice) msgs.push({ role: "advice", text: response.advice, priceRange: response.market_price_range || undefined });
          setChatHistory(h => [...h, ...msgs]);
          speak(response.next_question);
        } else {
          // Unclear or "no" → AI generates a helpful follow-up question
          const msgs2: ChatMessage[] = [{ role: "ai", text: response.next_question }];
          if (response.advice) msgs2.push({ role: "advice", text: response.advice, priceRange: response.market_price_range || undefined });
          setChatHistory(h => [...h, ...msgs2]);
          speak(response.next_question);
        }
      } catch (e) {
        console.error(e);
        speak("Dạ bác xác nhận đăng sản phẩm này không ạ? Bác nói Có hoặc Không nhé.");
        setChatHistory(h => [...h, { role: "ai", text: "Dạ bác xác nhận đăng sản phẩm này không ạ? Bác nói Có hoặc Không nhé." }]);
      }
      return;
    }

    try {
      const response: VoiceChatResponse = await sendVoiceChatMessage({
        current_field: currentField,
        transcript,
        collected_fields: collectedFieldsRef.current,
        conversation_history: newHistory.filter(m => m.role !== "advice").map(m => ({ role: m.role as "ai" | "user", text: m.text })),
      });

      let nextIndex = stepIndexRef.current;
      const updatedFields = { ...collectedFieldsRef.current };
      const updatedConfidences = { ...confidencesRef.current };

      if (response.intent === "skip") {
        nextIndex++;
      } else if (response.intent === "go_back") {
        nextIndex = Math.max(0, nextIndex - 1);
      } else if (response.intent === "correct") {
        // Target specifically
        if (response.correction_target) {
           updatedFields[response.correction_target] = response.correction_value;
        }
      } else {
        // Answer intent
        if (response.extracted_value !== undefined && response.extracted_value !== null) {
          updatedFields[currentField] = response.extracted_value;
          updatedConfidences[currentField] = response.confidence;
        }
        
        // Handle extra fields mentioned
        if (response.extra_fields && response.extra_fields.length > 0) {
          response.extra_fields.forEach(f => {
            if (f.value !== undefined && f.value !== null) {
              updatedFields[f.field] = f.value;
              updatedConfidences[f.field] = 0.8; 
            }
          });
        }
        
        nextIndex++;
        // Skip ahead if we already have the next field filled via extra_fields
        while (nextIndex < FLOW_STEPS.length - 1 && updatedFields[FLOW_STEPS[nextIndex]] !== undefined) {
           nextIndex++;
        }
      }

      setCollectedFields(updatedFields);
      setConfidences(updatedConfidences);
      setStepIndex(nextIndex);

      const newMsgs: ChatMessage[] = [{ role: "ai", text: response.next_question }];
      if (response.advice) newMsgs.push({ role: "advice", text: response.advice, priceRange: response.market_price_range || undefined });
      setChatHistory(h => [...h, ...newMsgs]);
      speak(response.next_question);

    } catch (e) {
      console.error(e);
      speak("Xin lỗi bác, có lỗi kĩ thuật. Bác nói lại giúp con nghen.");
      setChatHistory(h => [...h, { role: "ai", text: "Xin lỗi bác, có lỗi kĩ thuật. Bác nói lại giúp con nghen." }]);
    }
  }, [speak, finishFlow]);

  const handleSilence = useCallback(() => {
    silenceCountRef.current += 1;
    if (silenceCountRef.current >= 3) {
      setState("listening");
      setChatHistory(h => [...h, { role: "ai", text: "Bác cứ từ từ nhé, khi nào sẵn sàng bác nhấn nút micro." }]);
    } else {
      speak("Bác ơi, bác nói giúp con nghen.");
      setChatHistory(h => [...h, { role: "ai", text: "Bác ơi, bác nói giúp con nghen." }]);
    }
  }, [speak]);

  const startListening = useCallback(async () => {
    setState("listening");
    setInterimText("");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        cleanupAudio();
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // If recording is too short, assume nothing was said
        if (audioBlob.size < 1000) {
          handleSilence();
          return;
        }

        setState("processing");
        try {
          const text = await transcribeSpeech(audioBlob);
          if (text && text.trim()) {
            silenceCountRef.current = 0;
            processTranscript(text);
          } else {
            handleSilence();
          }
        } catch (error) {
          console.error("STT Error", error);
          handleSilence();
        }
      };

      // VAD setup
      const audioCtx = new window.AudioContext();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      analyser.fftSize = 512;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let silenceStart = Date.now();

      silenceTimerRef.current = setInterval(() => {
        if (stateRef.current !== "listening") return;
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / bufferLength;

        if (average > 15) { // User is speaking
          silenceStart = Date.now();
        } else { // Silence
          if (Date.now() - silenceStart > 2000) { // 2 seconds of silence
            if (mediaRecorder.state === "recording") {
              mediaRecorder.stop();
            }
          }
        }
      }, 100);

      mediaRecorder.start(100); // collect 100ms chunks
    } catch (e) {
      console.error("Microphone error", e);
      alert("Lỗi truy cập microphone. Vui lòng cấp quyền sử dụng mic.");
      setState("error");
    }
  }, [handleSilence, processTranscript]); // Thêm dependencies phù hợp

  const stopListeningManual = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };
  // Note: Duplicate implementations of `processTranscript` and `finishFlow` were
  // present below; they have been removed because the file already defines
  // `processTranscript` (as a `useCallback`) and `finishFlow` above. Keeping the
  // `useCallback` variant ensures stable references for hooks like
  // `startListening` which depend on `processTranscript`.

  const startConversation = useCallback(() => {
    // Start with a friendly AI greeting and begin TTS → listening flow
    const greeting = "Dạ chào bác, con là trợ lý. Con sẽ hỏi vài thông tin để đăng sản phẩm, bác cứ nói tự nhiên nhé.";
    setChatHistory(h => [...h, { role: "ai", text: greeting }] as ChatMessage[]);
    // speak will trigger startListening when audio ends via handleAudioEnd
    speak(greeting).catch(() => {
      // If TTS fails, directly start listening
      startListening();
    });
  }, [speak, startListening]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-900 rounded-xl max-w-2xl mx-auto overflow-hidden shadow-sm flex flex-col h-[500px]">
      
      {/* Hidden audio element for Zalo TTS */}
      <audio ref={audioRef} onEnded={handleAudioEnd} className="hidden" />

      {/* Header */}
      <div className="flex justify-between items-center bg-white/50 dark:bg-surface/50 border-b border-blue-100 p-4">
         <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">Trợ Lý AI Cạp Nông</span>
         </div>
         <div className="text-xs text-foreground-muted bg-white dark:bg-surface px-3 py-1 rounded-full shadow-sm">
            Bước {Math.min(stepIndex + 1, FLOW_STEPS.length)} / {FLOW_STEPS.length}
         </div>
         {onCancel && (
           <button onClick={onCancel} className="text-sm text-red-500 hover:text-red-700 underline font-medium">Hủy</button>
         )}
      </div>

      {/* Main chat area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {state === "idle" ? (
           <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                 <Mic className="w-10 h-10 text-primary" />
              </div>
              <p className="text-foreground-muted text-sm max-w-sm">
                Con AI sẽ đồng hành và hỏi từng bước để giúp bác điền form nhanh chóng.
              </p>
              <button 
                onClick={startConversation}
                className="bg-primary text-white font-bold py-2.5 px-6 rounded-full hover:bg-primary-light shadow-md hover:scale-105 transition-all"
              >
                Bắt đầu hội thoại
              </button>
           </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'advice' ? (
                  <div className="max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm mr-8 rounded-tl-none bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/15 border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-amber-800 dark:text-amber-300">{msg.text}</span>
                        {msg.priceRange && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                              Giá thị trường: {msg.priceRange}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm text-sm ${msg.role === 'user' ? 'bg-primary text-white ml-8 rounded-tr-none' : 'bg-white dark:bg-surface border border-border text-foreground mr-8 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            
            {/* Interim processing indicator */}
            {(state === "listening" || state === "processing") && interimText && (
               <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-primary/20 text-foreground italic ml-8 rounded-tr-none text-sm opacity-80 border border-primary/20">
                  ... {interimText}
                </div>
              </div>
            )}

            {/* AI typing/thinking indicator */}
            {state === "processing" && (
                <div className="flex justify-start">
                   <div className="rounded-2xl px-4 py-3 bg-white dark:bg-surface border border-border shadow-sm rounded-tl-none text-sm w-16">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s"}}></div>
                        <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: "0.4s"}}></div>
                      </div>
                   </div>
                </div>
            )}

            {/* Fix Issue #14: TTS loading indicator — shown while Zalo AI is fetching audio */}
            {state === "speaking" && ttsLoading && (
                <div className="flex justify-start">
                   <div className="rounded-2xl px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-sm rounded-tl-none text-sm mr-8 flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                      <span className="text-blue-600 dark:text-blue-400 text-xs">Đang chuẩn bị giọng nói...</span>
                   </div>
                </div>
            )}

            {/* Fix Issue #14: TTS fallback warning — shown when Zalo TTS failed */}
            {ttsFallback && (
                <div className="flex justify-start">
                   <div className="rounded-2xl px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-tl-none text-xs mr-8 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      <span className="text-yellow-600 dark:text-yellow-400">Đang dùng giọng dự phòng</span>
                   </div>
                </div>
            )}
          </div>
        )}
      </div>

      {/* Control Footer */}
      {state !== "idle" && state !== "done" && (
        <div className="bg-white dark:bg-surface border-t border-border p-4 flex flex-col items-center">
            <div className="flex justify-between w-full max-w-sm mb-2 px-4 text-xs font-medium text-foreground-muted">
                <span>{STEP_LABELS[FLOW_STEPS[stepIndex]] || "Đang lấy thông tin..."}</span>
                {state === "speaking" && <span className="text-blue-500 animate-pulse flex items-center gap-1"><PlayCircle className="w-3 h-3"/> {ttsLoading ? "Đang tải..." : "Đang nói"}</span>}
                {state === "listening" && <span className="text-green-500 animate-pulse flex items-center gap-1"><Mic className="w-3 h-3"/> Đang nghe</span>}
                {state === "processing" && <span className="text-orange-500 animate-pulse flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Đang xử lý</span>}
            </div>

            <div className="flex items-center gap-6">
                {/* Fix Issue #8: Removed hidden sm:flex — buttons must be visible on mobile */}
                <button 
                  disabled={state !== "listening" || stepIndex === 0}
                  onClick={() => processTranscript("quay lại")}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-foreground-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Quay lại bước trước"
                >
                  <RotateCcw className="w-4 h-4"/>
                </button>

                <button 
                  onClick={() => {
                    if (state === "listening") stopListeningManual();
                    else if (state !== "processing") startListening();
                  }}
                  disabled={state === "processing"}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    state === "listening" 
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse" 
                      : "bg-primary hover:bg-primary-light text-white shadow-md disabled:bg-gray-400"
                  }`}
                >
                   {state === "listening" ? <SquareSquare className="w-5 h-5"/> : <Mic className="w-6 h-6"/>}
                </button>

                {/* Fix Issue #8: Removed hidden sm:flex — buttons must be visible on mobile */}
                <button 
                  disabled={state !== "listening"}
                  onClick={() => processTranscript("bỏ qua")}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-foreground-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Bỏ qua (tự tìm sau)"
                >
                  <SkipForward className="w-4 h-4"/>
                </button>
            </div>
            
            <p className="text-[10px] text-foreground-muted mt-3 text-center">
              Chỉ cần nói tự nhiên. Nếu không muốn trả lời, bác nói <b className="text-foreground">"Bỏ qua"</b> nha.
            </p>
        </div>
      )}

      {/* Done State Footer */}
      {state === "done" && (
         <div className="bg-green-50 dark:bg-green-900/10 border-t border-green-200 p-6 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
            <h3 className="font-bold text-green-700">Đã hoàn thành!</h3>
            <p className="text-sm text-green-600/80 mb-4 text-center">Con đã ghi chú đủ thông tin vào biểu mẫu, bác xem lại nhé.</p>
         </div>
      )}
    </div>
  );
}


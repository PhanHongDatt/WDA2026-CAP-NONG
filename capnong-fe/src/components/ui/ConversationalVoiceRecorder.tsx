"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, SquareSquare, ArrowRight, Loader2, PlayCircle, SkipForward, RotateCcw, CheckCircle2 } from "lucide-react";
import { synthesizeSpeech, sendVoiceChatMessage, VoiceChatResponse } from "@/services/api/voice";

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
  role: "ai" | "user";
  text: string;
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, interimText]);

  // Handle Speech Synthesis (Zalo AI)
  const speak = async (text: string) => {
    try {
      setState("speaking");
      const url = await synthesizeSpeech(text, 1); // 1 = South women
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
      setAudioUrl(url);
    } catch (error) {
      console.error("TTS Failed", error);
      // Fallback to Web Speech API
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";
      utterance.onend = () => {
        if (state !== "done") startListening();
      };
      speechSynthesis.speak(utterance);
    }
  };

  const handleAudioEnd = () => {
    if (state === "speaking") {
      startListening();
    }
  };

  const startConversation = () => {
    setState("hello");
    setChatHistory([{ role: "ai", text: "Chào bác. Con sẽ giúp bác đăng sản phẩm. Bác có thể nói 'bỏ qua' nếu không muốn trả lời một câu nhé. Bác đang bán loại nông sản gì ạ?" }]);
    speak("Chào bác. Con sẽ giúp bác đăng sản phẩm. Bác có thể nói bỏ qua nếu không muốn trả lời một câu nhé. Bác đang bán loại nông sản gì ạ?");
  };

  const startListening = () => {
    setState("listening");
    setInterimText("");
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ Web Speech API.");
      setState("error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimText(finalTranscript + interim);
    };

    recognition.onend = () => {
      if (finalTranscript.trim()) {
        processTranscript(finalTranscript);
      } else {
        // If nothing was said, prompt again or wait
        setState("listening");
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Microphone error", e);
    }
  };

  const stopListeningManual = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    // Update chat history with user reply
    const newHistory = [...chatHistory, { role: "user", text: transcript } as ChatMessage];
    setChatHistory(newHistory);
    setInterimText("");
    setState("processing");

    const currentField = FLOW_STEPS[stepIndex];
    if (currentField === "confirm") {
      if (transcript.toLowerCase().includes("có") || transcript.toLowerCase().includes("ok") || transcript.toLowerCase().includes("đúng")) {
        finishFlow();
      } else if (transcript.toLowerCase().includes("không")) {
        // Go back
        setStepIndex(0);
        speak("Dạ vậy con sẽ bắt đầu lại từ đầu nhé. Bác đang bán nông sản gì ạ?");
        setChatHistory(h => [...h, { role: "ai", text: "Dạ vậy con sẽ bắt đầu lại từ đầu nhé. Bác đang bán nông sản gì ạ?" }]);
      } else {
        speak("Dạ bác xác nhận đăng sản phẩm này không ạ? Bác nói Có hoặc Không nhé.");
      }
      return;
    }

    try {
      const response: VoiceChatResponse = await sendVoiceChatMessage({
        current_field: currentField,
        transcript,
        collected_fields: collectedFields,
        conversation_history: newHistory,
      });

      let nextIndex = stepIndex;
      const updatedFields = { ...collectedFields };
      const updatedConfidences = { ...confidences };

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
              // Default to medium-high confidence for extra fields derived from side mentions
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

      setChatHistory(h => [...h, { role: "ai", text: response.next_question }]);
      speak(response.next_question);

    } catch (e) {
      console.error(e);
      speak("Xin lỗi bác, có lỗi kĩ thuật. Bác nói lại giúp con nghen.");
      setChatHistory(h => [...h, { role: "ai", text: "Xin lỗi bác, có lỗi kĩ thuật. Bác nói lại giúp con nghen." }]);
      // state will eventually become "listening" again after speak ends.
    }
  };

  const finishFlow = () => {
    setState("done");
    if (onResult) {
      onResult({
        name: collectedFields.name || "",
        description: collectedFields.description || "",
        price: collectedFields.price || 0,
        unit: collectedFields.quantity_unit || "KG",
        quantity: collectedFields.quantity || 0,
        location: collectedFields.location || "",
        harvestDate: collectedFields.harvestDate || "",
        farmingMethod: collectedFields.farmingMethod || "ORGANIC",
        confidence: confidences,
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-900 rounded-xl max-w-2xl mx-auto overflow-hidden shadow-sm flex flex-col h-[500px]">
      
      {/* Hidden audio element for Zalo TTS */}
      <audio ref={audioRef} onEnded={handleAudioEnd} className="hidden" />

      {/* Header */}
      <div className="flex justify-between items-center bg-white/50 dark:bg-surface/50 border-b border-blue-100 p-4">
         <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">Sổ Tay Khai Báo Bằng Giọng Nói</span>
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
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm text-sm ${msg.role === 'user' ? 'bg-primary text-white ml-8 rounded-tr-none' : 'bg-white dark:bg-surface border border-border text-foreground mr-8 rounded-tl-none'}`}>
                  {msg.text}
                </div>
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
          </div>
        )}
      </div>

      {/* Control Footer */}
      {state !== "idle" && state !== "done" && (
        <div className="bg-white dark:bg-surface border-t border-border p-4 flex flex-col items-center">
            <div className="flex justify-between w-full max-w-sm mb-2 px-4 text-xs font-medium text-foreground-muted">
                <span>{STEP_LABELS[FLOW_STEPS[stepIndex]] || "Đang lấy thông tin..."}</span>
                {state === "speaking" && <span className="text-blue-500 animate-pulse flex items-center gap-1"><PlayCircle className="w-3 h-3"/> Đang nói</span>}
                {state === "listening" && <span className="text-green-500 animate-pulse flex items-center gap-1"><Mic className="w-3 h-3"/> Đang nghe</span>}
            </div>

            <div className="flex items-center gap-6">
                <button 
                  disabled={state !== "listening" || stepIndex === 0}
                  onClick={() => processTranscript("quay lại")}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-foreground-muted disabled:opacity-50 disabled:cursor-not-allowed hidden sm:flex"
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

                <button 
                  disabled={state !== "listening"}
                  onClick={() => processTranscript("bỏ qua")}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-foreground-muted disabled:opacity-50 disabled:cursor-not-allowed hidden sm:flex"
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


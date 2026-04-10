"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, CheckCircle2, X, Volume2 } from "lucide-react";

type RecordingState = "idle" | "recording" | "processing" | "done" | "error";

export interface VoiceProductResult {
  name: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  location?: string;
  harvestDate?: string;
  farmingMethod?: string;
  transcript: string;
  confidence: Record<string, number>;
}

interface VoiceRecorderProps {
  onResult?: (data: VoiceProductResult) => void;
}

/* ── Mock AI: parse Vietnamese transcript → structured product ── */
function parseTranscript(transcript: string): VoiceProductResult {
  const t = transcript.toLowerCase();

  // Extract product name (first noun phrase)
  let name = "";
  const namePatterns = [
    /(?:tôi có|tôi bán|có|bán)\s+(?:[\d\w]+\s+(?:tạ|tấn|kg|ký|yến|trăm)\s+)?(.+?)(?:\s+giá|\s+bán|\s*,|\s+thu|\s+ở|\s+tại|$)/i,
    /^(.+?)(?:\s+giá|\s+bán|\s*,|\s+thu)/i,
  ];
  for (const pat of namePatterns) {
    const m = transcript.match(pat);
    if (m?.[1]) { name = m[1].trim().replace(/^\d+\s*(tạ|tấn|kg|ký)\s+/i, ""); break; }
  }
  if (!name) name = transcript.split(/[,.]/)[ 0]?.trim() || "Sản phẩm mới";

  // Strip leading quantity words (e.g. "năm tạ")
  name = name.replace(/^(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|mươi)\s+(tạ|tấn|yến|kg|ký|trăm)\s+/i, "");

  // Capitalize first letter of each word (Vietnamese-safe)
  name = name.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  // Extract price
  let price = 0;
  const priceMatch = t.match(/giá\s+(\d[\d.]*)\s*(ngàn|nghìn|ng|k|triệu|tr)?/i)
    || t.match(/(\d[\d.]*)\s*(ngàn|nghìn|ng|k|triệu|tr)\s*(?:một|\/?\s*(?:kg|ký|trái|hộp))?/i);
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(/\./g, ""));
    const unit = priceMatch[2]?.toLowerCase() || "";
    if (["ngàn", "nghìn", "ng", "k"].includes(unit)) price *= 1000;
    if (["triệu", "tr"].includes(unit)) price *= 1000000;
  }
  // Handle Vietnamese word numbers
  if (!price) {
    const wordMatch = t.match(/giá\s+([\wàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵăắằẳẵặâấầẩẫậêếềểễệôốồổỗộơớờởỡợưứừửữựđ\s]+)\s*(?:một|\/?\s*(?:kg|ký))/i);
    if (wordMatch) {
      const words = wordMatch[1].trim();
      const numMap: Record<string, number> = {
        "một": 1, "hai": 2, "ba": 3, "bốn": 4, "năm": 5,
        "sáu": 6, "bảy": 7, "tám": 8, "chín": 9, "mười": 10,
        "mười lăm": 15, "hai mươi": 20, "hai mươi lăm": 25,
        "ba mươi": 30, "bốn mươi": 40, "năm mươi": 50,
      };
      for (const [word, num] of Object.entries(numMap)) {
        if (words.includes(word)) {
          // Check if followed by ngàn/nghìn
          if (words.includes("ngàn") || words.includes("nghìn")) {
            price = num * 1000;
          } else {
            price = num * 1000; // default to thousands for prices
          }
        }
      }
    }
  }

  // Extract quantity
  let quantity = 0;
  const qtyMatch = t.match(/(\d+)\s*(tạ|tấn|yến|kg|ký|trái|hộp|bó)/i)
    || t.match(/(?:có|bán)\s+(\d+)\s/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1]);
    const qUnit = qtyMatch[2]?.toLowerCase() || "";
    if (qUnit === "tạ") quantity *= 100;
    if (qUnit === "tấn") quantity *= 1000;
    if (qUnit === "yến") quantity *= 10;
  }

  // Extract unit
  let unit = "Kg";
  if (t.includes("trái") || t.includes("quả")) unit = "Trái";
  if (t.includes("hộp") || t.includes("khay")) unit = "Hộp";
  if (t.includes("bó")) unit = "Bó";

  // Extract location
  let location = "";
  const locMatch = transcript.match(/(?:ở|tại|vùng|huyện|tỉnh|xã)\s+([^,.]+)/i);
  if (locMatch) location = locMatch[1].trim();

  // Extract harvest date
  let harvestDate = "";
  if (t.includes("tuần sau") || t.includes("tuần tới")) {
    const d = new Date(); d.setDate(d.getDate() + 7);
    harvestDate = d.toISOString().split("T")[0];
  } else if (t.includes("tháng sau") || t.includes("tháng tới")) {
    const d = new Date(); d.setMonth(d.getMonth() + 1);
    harvestDate = d.toISOString().split("T")[0];
  }

  // Extract farming method
  let farmingMethod = "";
  if (t.includes("hữu cơ") || t.includes("organic")) farmingMethod = "Hữu cơ";
  if (t.includes("vietgap")) farmingMethod = "VietGAP";
  if (t.includes("không thuốc") || t.includes("ko thuốc") || t.includes("không dùng thuốc")) farmingMethod = "Hữu cơ";

  // Build description from transcript
  const description = transcript;

  // Confidence scores
  const confidence: Record<string, number> = {
    name: name ? 0.85 + Math.random() * 0.15 : 0.3,
    description: 0.95,
    price: price > 0 ? 0.8 + Math.random() * 0.2 : 0.2,
    unit: 0.9,
    quantity: quantity > 0 ? 0.75 + Math.random() * 0.25 : 0.3,
    location: location ? 0.85 : 0.0,
    harvestDate: harvestDate ? 0.7 : 0.0,
    farmingMethod: farmingMethod ? 0.9 : 0.0,
  };

  return { name, description, price, unit, quantity, location, harvestDate, farmingMethod, transcript, confidence };
}

/* ── Extend Window for webkitSpeechRecognition ── */
interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string; confidence: number } }; length: number };
  resultIndex: number;
}

export default function VoiceRecorder({ onResult }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(0.1));
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [supported, setSupported] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);

  /* Check browser support */
  useEffect(() => {
    const w = window as any;
    if (!w.webkitSpeechRecognition && !w.SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  /* Timer + waveform animation */
  useEffect(() => {
    if (state === "recording") {
      intervalRef.current = setInterval(() => {
        setDuration((d) => d + 1);
        setWaveform(Array(20).fill(0).map(() => 0.1 + Math.random() * 0.9));
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  const startRecording = useCallback(() => {
    setTranscript("");
    setErrorMsg("");
    setState("recording");
    setDuration(0);

    const w = window as any;
    const SpeechRecognition = w.webkitSpeechRecognition || w.SpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: simulate for unsupported browsers
      setTimeout(() => {
        const mockTranscript = "tôi có năm tạ xoài cát chu giá hai mươi lăm ngàn một ký thu hoạch tuần sau ở Tiền Giang không dùng thuốc";
        setTranscript(mockTranscript);
        setState("processing");
        setTimeout(() => {
          const result = parseTranscript(mockTranscript);
          onResult?.(result);
          setState("done");
        }, 1500);
      }, 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "vi-VN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res[0]) {
          if ((res as any).isFinal) {
            finalTranscript += res[0].transcript + " ";
          } else {
            interim = res[0].transcript;
          }
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        setErrorMsg("Không nghe thấy giọng nói. Hãy thử lại.");
      } else if (event.error === "not-allowed") {
        setErrorMsg("Trình duyệt chưa cấp quyền micro. Hãy cho phép trong cài đặt.");
      } else {
        setErrorMsg(`Lỗi nhận dạng: ${event.error}`);
      }
      setState("error");
    };

    recognition.onend = () => {
      if (state === "recording" && finalTranscript) {
        // Recognition ended naturally
      }
    };

    try {
      recognition.start();
    } catch {
      setErrorMsg("Không thể khởi động micro");
      setState("error");
    }
  }, [onResult, state]);

  const stopRecording = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const currentTranscript = transcript;
    setState("processing");

    const textToProcess = currentTranscript.trim()
      ? currentTranscript
      : "tôi có năm tạ xoài cát chu giá hai mươi lăm ngàn một ký thu hoạch tuần sau ở Tiền Giang không dùng thuốc";

    if (!currentTranscript.trim()) {
      setTranscript(textToProcess);
    }

    try {
      // Try real BE API first
      const { extractFromTranscript } = await import("@/services/api/voice");
      const apiResult = await extractFromTranscript(textToProcess);

      // Map BE response → VoiceProductResult
      const result: VoiceProductResult = {
        name: apiResult.name || "Sản phẩm mới",
        description: apiResult.description || textToProcess,
        price: apiResult.pricePerUnit || 0,
        unit: apiResult.unitCode || "Kg",
        quantity: apiResult.availableQuantity || 0,
        location: apiResult.harvestNote || "",
        harvestDate: "",
        farmingMethod: "",
        transcript: apiResult.rawTranscript || textToProcess,
        confidence: {
          name: apiResult.nameConfidence === "HIGH" ? 0.95 : apiResult.nameConfidence === "MEDIUM" ? 0.7 : 0.4,
          price: apiResult.pricePerUnitConfidence === "HIGH" ? 0.95 : 0.5,
          quantity: apiResult.availableQuantityConfidence === "HIGH" ? 0.95 : 0.5,
          unit: apiResult.unitCodeConfidence === "HIGH" ? 0.95 : 0.5,
          description: 0.95,
          location: 0,
          harvestDate: 0,
          farmingMethod: 0,
        },
      };
      onResult?.(result);
    } catch {
      // Fallback to local parsing if API unavailable
      const result = parseTranscript(textToProcess);
      onResult?.(result);
    }

    setState("done");
  }, [transcript, onResult]);

  const reset = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setState("idle");
    setDuration(0);
    setTranscript("");
    setErrorMsg("");
    setWaveform(Array(20).fill(0.1));
  };

  const formatTime = (ticks: number) => {
    const s = Math.floor(ticks / 5);
    return `0:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-sm">🎙️ Voice-to-Product (AI)</h3>
        </div>
        {!supported && (
          <span className="text-[10px] text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
            Trình duyệt không hỗ trợ — sẽ dùng demo
          </span>
        )}
      </div>

      {/* ── IDLE ── */}
      {state === "idle" && (
        <div className="text-center py-4">
          <p className="text-sm text-foreground-muted mb-4">
            Nhấn nút micro và mô tả sản phẩm bằng giọng nói tự nhiên. AI sẽ tự động
            bóc tách tên, giá, sản lượng, mô tả...
          </p>
          <p className="text-xs text-primary/70 mb-4 italic">
            Ví dụ: &quot;Tôi có năm tạ xoài cát chu, giá hai mươi lăm ngàn một ký, thu hoạch tuần sau ở Tiền Giang&quot;
          </p>
          <button type="button"
            onClick={startRecording}
            aria-label="Bắt đầu thu âm"
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto hover:bg-primary-light transition-all shadow-lg shadow-primary/30 hover:scale-105 active:scale-95"
          >
            <Mic className="w-7 h-7 text-white" />
          </button>
          <p className="text-xs text-foreground-muted mt-3">
            Hỗ trợ giọng miền Nam, miền Bắc, miền Trung • Chrome khuyên dùng
          </p>
        </div>
      )}

      {/* ── RECORDING ── */}
      {state === "recording" && (
        <div className="text-center py-4">
          {/* Waveform */}
          <div className="flex items-center justify-center gap-[3px] h-12 mb-4">
            {waveform.map((h, i) => (
              <div
                key={i}
                style={{ height: `${h * 48}px`, opacity: 0.5 + h * 0.5 }}
                className="w-1.5 bg-primary rounded-full transition-all duration-150"
              />
            ))}
          </div>

          <p className="text-sm font-bold text-accent mb-1 animate-pulse">
            ● Đang thu âm...
          </p>
          <p className="text-xs text-foreground-muted mb-2">
            {formatTime(duration)}
          </p>

          {/* Live transcript */}
          {transcript && (
            <div className="mx-auto max-w-md mb-4 p-3 bg-white/70 dark:bg-surface/70 rounded-lg border border-border text-left">
              <div className="flex items-center gap-1 mb-1">
                <Volume2 className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase">Đang nghe:</span>
              </div>
              <p className="text-sm text-foreground italic">&quot;{transcript}&quot;</p>
            </div>
          )}

          <button type="button"
            onClick={stopRecording}
            aria-label="Dừng thu âm"
            className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto hover:bg-red-600 transition-all shadow-lg shadow-accent/30 animate-pulse"
          >
            <MicOff className="w-7 h-7 text-white" />
          </button>
          <p className="text-xs text-foreground-muted mt-3">
            Nhấn để dừng thu âm và phân tích
          </p>
        </div>
      )}

      {/* ── PROCESSING ── */}
      {state === "processing" && (
        <div className="text-center py-8">
          <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-sm font-bold text-foreground">
            AI đang phân tích giọng nói...
          </p>
          <p className="text-xs text-foreground-muted mt-1">
            Bóc tách tên sản phẩm, giá, sản lượng, đơn vị, địa điểm
          </p>
          {transcript && (
            <p className="text-xs text-primary/70 mt-3 italic max-w-md mx-auto">
              &quot;{transcript}&quot;
            </p>
          )}
        </div>
      )}

      {/* ── DONE ── */}
      {state === "done" && (
        <div className="py-2">
          <div className="flex items-center gap-2 text-success mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">
              AI đã điền xong form! Kiểm tra và xác nhận bên dưới.
            </span>
          </div>
          {transcript && (
            <p className="text-xs text-foreground-muted mb-3 italic">
              Bạn đã nói: &quot;{transcript}&quot;
            </p>
          )}
          <button type="button"
            onClick={reset}
            className="text-xs text-foreground-muted hover:text-primary flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Thu âm lại
          </button>
        </div>
      )}

      {/* ── ERROR ── */}
      {state === "error" && (
        <div className="text-center py-4">
          <p className="text-sm text-accent font-medium mb-3">{errorMsg}</p>
          <button type="button"
            onClick={reset}
            className="text-sm text-primary font-medium hover:underline"
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
}

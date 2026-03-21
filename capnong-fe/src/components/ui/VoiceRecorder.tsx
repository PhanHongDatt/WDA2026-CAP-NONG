"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, CheckCircle2, X } from "lucide-react";

type RecordingState = "idle" | "recording" | "processing" | "done";

interface VoiceRecorderProps {
  onResult?: (data: {
    name: string;
    description: string;
    price: number;
    unit: string;
    quantity: number;
  }) => void;
}

export default function VoiceRecorder({ onResult }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(0.1));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const startRecording = () => {
    setState("recording");
    setDuration(0);
  };

  const stopRecording = () => {
    setState("processing");
    // Simulate AI processing
    setTimeout(() => {
      setState("done");
      onResult?.({
        name: "Xoài Cát Hòa Lộc",
        description:
          "Xoài cát Hòa Lộc chính vụ, trái to đều 400-500g, thịt vàng óng, ngọt thanh, không xơ. Thu hoạch ở vườn tại Cai Lậy, Tiền Giang.",
        price: 95000,
        unit: "Kg",
        quantity: 500,
      });
    }, 2500);
  };

  const reset = () => {
    setState("idle");
    setDuration(0);
    setWaveform(Array(20).fill(0.1));
  };

  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds / 5);
    return `0:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Mic className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-sm">🎙️ Voice-to-Product (AI)</h3>
      </div>

      {state === "idle" && (
        <div className="text-center py-4">
          <p className="text-sm text-foreground-muted mb-4">
            Nhấn nút micro và mô tả sản phẩm bằng giọng nói. AI sẽ tự động
            bóc tách tên, giá, sản lượng, mô tả...
          </p>
          <button type="button"
            onClick={startRecording}
            aria-label="Bắt đầu thu âm"
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto hover:bg-primary-light transition-all shadow-lg shadow-primary/30 hover:scale-105 active:scale-95"
          >
            <Mic className="w-7 h-7 text-white" />
          </button>
          <p className="text-xs text-foreground-muted mt-3">
            Hỗ trợ giọng miền Nam, miền Bắc, miền Trung
          </p>
        </div>
      )}

      {state === "recording" && (
        <div className="text-center py-4">
          {/* Waveform */}
          <div className="flex items-center justify-center gap-[3px] h-12 mb-4">
            {waveform.map((h, i) => (
              <div
                key={i}
                ref={(el) => { if (el) { el.style.height = `${h * 48}px`; el.style.opacity = String(0.5 + h * 0.5); } }}
                className="w-1.5 bg-primary rounded-full transition-all duration-150"
              />
            ))}
          </div>

          <p className="text-sm font-bold text-accent mb-1 animate-pulse">
            ● Đang thu âm...
          </p>
          <p className="text-xs text-foreground-muted mb-4">
            {formatTime(duration)}
          </p>

          <button type="button"
            onClick={stopRecording}
            aria-label="Dừng thu âm"
            className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto hover:bg-red-600 transition-all shadow-lg shadow-accent/30 animate-pulse"
          >
            <MicOff className="w-7 h-7 text-white" />
          </button>
          <p className="text-xs text-foreground-muted mt-3">
            Nhấn để dừng thu âm
          </p>
        </div>
      )}

      {state === "processing" && (
        <div className="text-center py-8">
          <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-sm font-bold text-foreground">
            AI đang phân tích giọng nói...
          </p>
          <p className="text-xs text-foreground-muted mt-1">
            Bóc tách tên sản phẩm, giá, sản lượng, mô tả
          </p>
        </div>
      )}

      {state === "done" && (
        <div className="py-2">
          <div className="flex items-center gap-2 text-success mb-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">
              AI đã điền xong form! Kiểm tra và xác nhận bên dưới.
            </span>
          </div>
          <button type="button"
            onClick={reset}
            className="text-xs text-foreground-muted hover:text-primary flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Thu âm lại
          </button>
        </div>
      )}
    </div>
  );
}

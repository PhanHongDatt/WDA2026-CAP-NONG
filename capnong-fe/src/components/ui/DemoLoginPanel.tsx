"use client";

import { useState } from "react";
import { Users, ShieldCheck, ShoppingCart, Sprout, Building2, UserCog } from "lucide-react";

const DEFAULT_PASSWORD = "Password123!";

const JUDGES = [1, 2, 3, 4, 5, 6] as const;

interface RoleInfo {
  role: string;
  label: string;
  username: (judgeNum: number) => string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  desc: string;
}

const ROLES: RoleInfo[] = [
  {
    role: "FARMER",
    label: "Nông dân",
    username: (n) => n === 0 ? "farmer" : `farmer_gk${n}`,
    icon: Sprout,
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200 hover:bg-green-100",
    desc: "Đăng sản phẩm, Voice Chat AI, Marketing Lab",
  },
  {
    role: "BUYER",
    label: "Người mua",
    username: (n) => n === 0 ? "buyer" : `buyer_gk${n}`,
    icon: ShoppingCart,
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    desc: "Mua hàng, giỏ hàng, đánh giá",
  },
  {
    role: "HTX_MANAGER",
    label: "Quản lý HTX",
    username: (n) => n === 0 ? "htx_manager" : `htxmgr_gk${n}`,
    icon: Building2,
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    desc: "Quản lý HTX, gom đơn, thành viên",
  },
  {
    role: "ADMIN",
    label: "Admin",
    username: (n) => n === 0 ? "admin" : `admin_gk${n}`,
    icon: ShieldCheck,
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200 hover:bg-red-100",
    desc: "Quản trị hệ thống, duyệt đơn",
  },
];

interface DemoLoginPanelProps {
  onSelectAccount: (username: string, password: string) => void;
}

export default function DemoLoginPanel({ onSelectAccount }: DemoLoginPanelProps) {
  const [selectedJudge, setSelectedJudge] = useState<number>(0);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-6">
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 bg-white/90 dark:bg-black/80 backdrop-blur-md border border-amber-200/50 dark:border-amber-900/50 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all py-3.5 rounded-xl"
      >
        <UserCog className="w-4 h-4" />
        {expanded ? "Ẩn panel demo" : "🏆 Demo Chung kết — Đăng nhập nhanh"}
      </button>

      {expanded && (
        <div className="mt-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
              Chọn Giám khảo → Chọn vai trò
            </h3>
          </div>

          {/* Judge selector */}
          <div className="flex gap-1.5 mb-4">
            <button
              type="button"
              onClick={() => setSelectedJudge(0)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedJudge === 0
                  ? "bg-amber-500 text-white shadow-md scale-[1.02]"
                  : "bg-white/70 dark:bg-white/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              Chung
            </button>
            {JUDGES.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedJudge(num)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedJudge === num
                    ? "bg-amber-500 text-white shadow-md scale-[1.02]"
                    : "bg-white/70 dark:bg-white/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                GK{num}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mb-3 text-center">
            {selectedJudge === 0
              ? "Tài khoản chung (dùng chung cho cả nhóm)"
              : `Tài khoản riêng cho Giám khảo ${selectedJudge} — không bị xung đột`}
          </p>

          {/* Role buttons */}
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const username = role.username(selectedJudge);
              return (
                <button
                  key={role.role}
                  type="button"
                  onClick={() => onSelectAccount(username, DEFAULT_PASSWORD)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all active:scale-95 ${role.bgColor}`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${role.color}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${role.color}`}>{role.label}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{role.desc}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{username}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-amber-600/60 dark:text-amber-400/60 mt-3 text-center">
            Mật khẩu chung: <span className="font-mono font-bold">{DEFAULT_PASSWORD}</span>
          </p>
        </div>
      )}
    </div>
  );
}

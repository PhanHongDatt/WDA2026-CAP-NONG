"use client";

import { forwardRef } from "react";

/* ─── Types ─── */
export interface PosterData {
  productName: string;
  headline: string;
  tagline: string;
  priceDisplay: string;
  badgeTexts: string[];
  shopName: string;
  ctaText: string;
  imageUrl?: string; // objectURL from uploaded file
}

export type TemplateId = "minimal" | "vibrant" | "pro";

interface PosterRendererProps {
  template: TemplateId;
  data: PosterData;
}

/* ═══════════════════════════════════════════════
   Template 1: Tối giản (Minimal)
   — Nền trắng, typography sạch, focus sản phẩm
   ═══════════════════════════════════════════════ */
function MinimalPoster({ data }: { data: PosterData }) {
  return (
    <div
      style={{
        width: 800,
        height: 1000,
        background: "linear-gradient(180deg, #FAFFF5 0%, #FFFFFF 40%)",
        fontFamily: "'Public Sans', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "48px 40px 36px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative top line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "linear-gradient(90deg, #2E7D32, #66BB6A, #A5D6A7)",
        }}
      />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#2E7D32", letterSpacing: 3, textTransform: "uppercase" }}>
          CẠP NÔNG
        </span>
      </div>

      {/* Image area */}
      <div
        style={{
          width: 360,
          height: 360,
          borderRadius: 24,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F5F5",
          border: "2px solid #E8F5E9",
          marginBottom: 24,
        }}
      >
        {data.imageUrl ? (
          <img src={data.imageUrl} alt={data.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 120 }}>🍊</span>
        )}
      </div>

      {/* Text content */}
      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h2 style={{ fontSize: 40, fontWeight: 900, color: "#1B5E20", lineHeight: 1.2, margin: "0 0 12px" }}>
          {data.headline}
        </h2>
        <p style={{ fontSize: 18, color: "#666", margin: "0 0 20px", lineHeight: 1.5 }}>
          {data.tagline}
        </p>

        {/* Price */}
        <div style={{ margin: "0 0 20px" }}>
          <span
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#C62828",
              background: "linear-gradient(135deg, #FFF3E0, #FFE0B2)",
              padding: "8px 28px",
              borderRadius: 16,
              display: "inline-block",
            }}
          >
            {data.priceDisplay}
          </span>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {data.badgeTexts.map((badge, i) => (
            <span
              key={i}
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#2E7D32",
                background: "#E8F5E9",
                padding: "6px 16px",
                borderRadius: 100,
                border: "1px solid #C8E6C9",
              }}
            >
              ✓ {badge}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          background: "#2E7D32",
          color: "#fff",
          fontWeight: 800,
          fontSize: 18,
          padding: "14px 48px",
          borderRadius: 14,
          textAlign: "center",
          marginTop: 16,
        }}
      >
        {data.ctaText}
      </div>

      {/* Footer */}
      <p style={{ fontSize: 11, color: "#999", marginTop: 12 }}>
        {data.shopName} • capnong.vn
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Template 2: Sống động (Vibrant)
   — Gradient nóng, layout năng động
   ═══════════════════════════════════════════════ */
function VibrantPoster({ data }: { data: PosterData }) {
  return (
    <div
      style={{
        width: 800,
        height: 1000,
        background: "linear-gradient(135deg, #FF8F00 0%, #FFB300 40%, #FFF176 100%)",
        fontFamily: "'Public Sans', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        padding: "40px",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 200,
          left: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(46,125,50,0.12)",
        }}
      />

      {/* Top tag */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, position: "relative", zIndex: 1 }}>
        <span
          style={{
            background: "#C62828",
            color: "#fff",
            fontWeight: 900,
            fontSize: 14,
            padding: "8px 20px",
            borderRadius: 100,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          🔥 Nông sản tươi
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", opacity: 0.9 }}>CẠP NÔNG</span>
      </div>

      {/* Image area */}
      <div
        style={{
          width: "100%",
          height: 400,
          borderRadius: 24,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          marginBottom: 28,
          position: "relative",
          zIndex: 1,
        }}
      >
        {data.imageUrl ? (
          <img src={data.imageUrl} alt={data.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 140 }}>🍊</span>
        )}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h2
          style={{
            fontSize: 42,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.15,
            margin: "0 0 12px",
            textShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {data.headline}
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", margin: "0 0 20px", lineHeight: 1.5, textShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
          {data.tagline}
        </p>

        {/* Price tag */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div
            style={{
              background: "#C62828",
              color: "#fff",
              fontWeight: 900,
              fontSize: 32,
              padding: "12px 32px",
              borderRadius: 16,
              boxShadow: "0 6px 20px rgba(198,40,40,0.4)",
              transform: "rotate(-2deg)",
            }}
          >
            {data.priceDisplay}
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {data.badgeTexts.map((badge, i) => (
            <span
              key={i}
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#1B5E20",
                background: "rgba(255,255,255,0.9)",
                padding: "6px 16px",
                borderRadius: 100,
              }}
            >
              ✅ {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        style={{
          background: "#1B5E20",
          color: "#fff",
          fontWeight: 800,
          fontSize: 20,
          padding: "16px 0",
          borderRadius: 16,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 8px 24px rgba(27,94,32,0.3)",
        }}
      >
        {data.ctaText}
      </div>

      {/* Footer */}
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 12, position: "relative", zIndex: 1 }}>
        {data.shopName} • capnong.vn
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Template 3: Chuyên nghiệp (Professional)
   — Nền tối, gold accent, B2B style
   ═══════════════════════════════════════════════ */
function ProPoster({ data }: { data: PosterData }) {
  return (
    <div
      style={{
        width: 800,
        height: 1000,
        background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        fontFamily: "'Public Sans', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        padding: "48px 44px 36px",
      }}
    >
      {/* Decorative gold line top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #D4A574, #F5D799, #D4A574)",
        }}
      />

      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "-10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,165,116,0.08), transparent)",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, position: "relative", zIndex: 1 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#D4A574", letterSpacing: 4, textTransform: "uppercase" }}>
            CẠP NÔNG
          </span>
          <div style={{ fontSize: 11, color: "#8899AA", marginTop: 2 }}>Premium Agriculture</div>
        </div>
        <div
          style={{
            border: "1.5px solid #D4A574",
            padding: "6px 18px",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 700,
            color: "#D4A574",
            letterSpacing: 1,
          }}
        >
          ĐỐI TÁC SỈ
        </div>
      </div>

      {/* Image area */}
      <div
        style={{
          width: "100%",
          height: 360,
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,165,116,0.2)",
          marginBottom: 32,
          position: "relative",
          zIndex: 1,
        }}
      >
        {data.imageUrl ? (
          <img src={data.imageUrl} alt={data.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 120 }}>🍊</span>
        )}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h2
          style={{
            fontSize: 38,
            fontWeight: 900,
            color: "#F5F5F5",
            lineHeight: 1.2,
            margin: "0 0 12px",
          }}
        >
          {data.headline}
        </h2>
        <p style={{ fontSize: 16, color: "#8899AA", margin: "0 0 24px", lineHeight: 1.6 }}>
          {data.tagline}
        </p>

        {/* Price + Badges row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #D4A574, #F5D799)",
              color: "#1a1a2e",
              fontWeight: 900,
              fontSize: 30,
              padding: "14px 32px",
              borderRadius: 14,
            }}
          >
            {data.priceDisplay}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.badgeTexts.slice(0, 2).map((badge, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#D4A574",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ◆ {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Remaining badges */}
        {data.badgeTexts.length > 2 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {data.badgeTexts.slice(2).map((badge, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#D4A574",
                }}
              >
                ◆ {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div
        style={{
          border: "2px solid #D4A574",
          color: "#D4A574",
          fontWeight: 800,
          fontSize: 18,
          padding: "16px 0",
          borderRadius: 14,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          letterSpacing: 1,
        }}
      >
        {data.ctaText}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11, color: "#556677" }}>
          {data.shopName}
        </p>
        <p style={{ fontSize: 11, color: "#556677" }}>
          capnong.vn
        </p>
      </div>

      {/* Bottom gold line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #D4A574, #F5D799, #D4A574)",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main PosterRenderer — forwardRef for html2canvas
   ═══════════════════════════════════════════════ */
const PosterRenderer = forwardRef<HTMLDivElement, PosterRendererProps>(
  function PosterRenderer({ template, data }, ref) {
    return (
      <div ref={ref} style={{ display: "inline-block" }}>
        {template === "minimal" && <MinimalPoster data={data} />}
        {template === "vibrant" && <VibrantPoster data={data} />}
        {template === "pro" && <ProPoster data={data} />}
      </div>
    );
  }
);

export default PosterRenderer;

/* ─── Local Fallback: Generate poster content without API ─── */
export function generateLocalPosterContent(
  productName: string,
  pricePerUnit?: number,
  shopName?: string,
): PosterData {
  const price = pricePerUnit
    ? new Intl.NumberFormat("vi-VN").format(pricePerUnit) + "đ/kg"
    : "Liên hệ";

  return {
    productName,
    headline: productName,
    tagline: "Thu hoạch tự nhiên · Giao tận tay · Cam kết tươi sạch",
    priceDisplay: price,
    badgeTexts: ["Tươi từ vườn", "Cam kết chất lượng", "Giao hàng nhanh"],
    shopName: shopName || "Nhà Vườn Cạp Nông",
    ctaText: "Đặt ngay tại Cạp Nông →",
  };
}

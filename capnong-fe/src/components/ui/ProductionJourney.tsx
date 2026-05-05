"use client";

import React from "react";
import Image from "next/image";

import { LeafIcon } from "@/components/ui/icons/LeafIcon";
import { TornEdgeTop, TornEdgeBottom } from "@/components/ui/TornEdges";

/**
 * ProductionJourney — "Hành trình nông sản" section
 * A horizontal timeline showing the 5 steps of produce from farm to table,
 * with torn-paper background, varied curved dashed SVG connectors, and brand styling.
 */

const STEPS = [
  {
    img: "/images/journey/step-harvest.png",
    title: "Thu hoạch",
    desc: "Nông sản được thu hoạch từ những nông trại uy tín",
  },
  {
    img: "/images/journey/step-inspection.png",
    title: "Kiểm định",
    desc: "Kiểm tra chất lượng đạt chuẩn an toàn",
  },
  {
    img: "/images/journey/step-packaging.png",
    title: "Đóng gói",
    desc: "Đóng gói cẩn thận, giữ trọn độ tươi ngon",
  },
  {
    img: "/images/journey/step-delivery.png",
    title: "Vận chuyển",
    desc: "Giao hàng nhanh chóng đến tận tay bạn",
  },
  {
    img: "/images/journey/step-dining.png",
    title: "Đến bàn ăn",
    desc: "Nông sản tươi ngon cho bữa ăn lành mạnh",
  },
];

/**
 * Each connector has a unique curve shape for visual variety.
 */
const CONNECTOR_PATHS = [
  // Connector 1: wave up-down
  "M0 10 C 30 -10, 70 30, 100 10",
  // Connector 2: wave down-up
  "M0 10 C 25 30, 75 -10, 100 10",
  // Connector 3: arch up
  "M0 10 Q 50 -10, 100 10",
  // Connector 4: arch down
  "M0 10 Q 50 30, 100 10",
];

function CurvedConnector({ index }: { index: number }) {
  const pathD = CONNECTOR_PATHS[index % CONNECTOR_PATHS.length];
  return (
    <svg
      className="journey-connector"
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={pathD}
        vectorEffect="non-scaling-stroke"
        stroke="var(--color-primary, #2E7D32)"
        strokeWidth="2.5"
        strokeDasharray="6 4"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
    </svg>
  );
}




export default function ProductionJourney() {
  return (
    <section className="journey-section" id="journey">
      {/* Torn paper top edge */}
      <TornEdgeTop />

      <div className="journey-content">
        {/* Section Title */}
        <h2 className="journey-title">
          <span className="journey-title-text">
            Hành trình{" "}
            <span className="journey-title-highlight">
              nông sản
              {/* Paint-stroke underline */}
              <svg
                className="journey-paint-stroke"
                viewBox="0 0 120 12"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 8 C20 3, 40 10, 60 6 S100 3, 118 7"
                  stroke="var(--color-primary, #2E7D32)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.35"
                />
              </svg>
            </span>
          </span>
          <LeafIcon />
        </h2>

        {/* Timeline */}
        <div className="journey-timeline">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.title}>
              {/* Step Item */}
              <div
                className="journey-step"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="journey-step-img-wrapper">
                  <Image
                    src={step.img}
                    alt={step.title}
                    width={112}
                    height={112}
                    className="journey-step-img"
                  />
                </div>
                <h3 className="journey-step-title">{step.title}</h3>
                <p className="journey-step-desc">{step.desc}</p>
              </div>

              {/* Connector (not after the last step) */}
              {i < STEPS.length - 1 && (
                <div className="journey-connector-wrapper">
                  <CurvedConnector index={i} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Torn paper bottom edge */}
      <TornEdgeBottom />
    </section>
  );
}

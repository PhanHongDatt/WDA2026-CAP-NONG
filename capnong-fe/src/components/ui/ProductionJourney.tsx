"use client";

import React from "react";
import Image from "next/image";

import { LeafIcon } from "@/components/ui/icons/LeafIcon";

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

/**
 * Torn paper edge SVG — extracted from torn_paper_9_variants.svg (variant 9 / bottom-left).
 * Renders a jagged, natural torn-paper edge effect.
 */
function TornEdgeTop() {
  return (
    <div className="journey-torn-svg-wrapper journey-torn-svg-wrapper--top">
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="journey-torn-svg"
        aria-hidden="true"
      >
        <path
          d={`M0 0 L0 28 
            C2 28, 4 26, 8 27 C12 28, 14 25, 18 26 C22 27, 24 24, 28 25 
            C32 26, 36 23, 40 24 C44 25, 46 22, 50 23 C54 24, 58 21, 62 22 
            C66 23, 68 26, 72 25 C76 24, 80 27, 84 26 C88 25, 92 28, 96 27 
            C100 26, 104 23, 108 24 C112 25, 114 22, 118 21 C122 20, 126 23, 130 24 
            C134 25, 138 22, 142 23 C146 24, 148 27, 152 26 C156 25, 160 28, 164 27 
            C168 26, 172 24, 176 25 C180 26, 182 23, 186 22 C190 21, 194 24, 198 25 
            C202 26, 206 23, 210 22 C214 21, 218 24, 222 25 C226 26, 228 28, 232 27 
            C236 26, 240 23, 244 24 C248 25, 252 22, 256 23 C260 24, 264 27, 268 26 
            C272 25, 276 22, 280 23 C284 24, 288 21, 292 22 C296 23, 300 26, 304 25 
            C308 24, 312 27, 316 26 C320 25, 324 22, 328 23 C332 24, 336 21, 340 22 
            C344 23, 348 26, 352 25 C356 24, 360 27, 364 26 C368 25, 372 23, 376 24 
            C380 25, 384 22, 388 23 C392 24, 396 27, 400 26 C404 25, 408 28, 412 27 
            C416 26, 420 23, 424 24 C428 25, 432 22, 436 21 C440 20, 444 23, 448 24 
            C452 25, 456 28, 460 27 C464 26, 468 23, 472 24 C476 25, 480 22, 484 23 
            C488 24, 492 27, 496 26 C500 25, 504 22, 508 23 C512 24, 516 21, 520 22 
            C524 23, 528 26, 532 25 C536 24, 540 27, 544 26 C548 25, 552 22, 556 23 
            C560 24, 564 21, 568 22 C572 23, 576 26, 580 25 C584 24, 588 27, 592 26 
            C596 25, 600 23, 604 24 C608 25, 612 22, 616 23 C620 24, 624 27, 628 26 
            C632 25, 636 28, 640 27 C644 26, 648 23, 652 24 C656 25, 660 22, 664 21 
            C668 20, 672 23, 676 24 C680 25, 684 28, 688 27 C692 26, 696 23, 700 24 
            C704 25, 708 22, 712 23 C716 24, 720 27, 724 26 C728 25, 732 22, 736 23 
            C740 24, 744 21, 748 22 C752 23, 756 26, 760 25 C764 24, 768 27, 772 26 
            C776 25, 780 22, 784 23 C788 24, 792 21, 796 22 C800 23, 804 26, 808 25 
            C812 24, 816 27, 820 26 C824 25, 828 23, 832 24 C836 25, 840 22, 844 23 
            C848 24, 852 27, 856 26 C860 25, 864 28, 868 27 C872 26, 876 23, 880 24 
            C884 25, 888 22, 892 21 C896 20, 900 23, 904 24 C908 25, 912 28, 916 27 
            C920 26, 924 23, 928 24 C932 25, 936 22, 940 23 C944 24, 948 27, 952 26 
            C956 25, 960 22, 964 23 C968 24, 972 21, 976 22 C980 23, 984 26, 988 25 
            C992 24, 996 27, 1000 26 C1004 25, 1008 22, 1012 23 C1016 24, 1020 21, 1024 22 
            C1028 23, 1032 26, 1036 25 C1040 24, 1044 27, 1048 26 C1052 25, 1056 23, 1060 24 
            C1064 25, 1068 22, 1072 23 C1076 24, 1080 27, 1084 26 C1088 25, 1092 28, 1096 27 
            C1100 26, 1104 23, 1108 24 C1112 25, 1116 22, 1120 21 C1124 20, 1128 23, 1132 24 
            C1136 25, 1140 28, 1144 27 C1148 26, 1152 23, 1156 24 C1160 25, 1164 22, 1168 23 
            C1172 24, 1176 27, 1180 26 C1184 25, 1188 22, 1192 23 C1196 24, 1200 26, 1200 25 
            L1200 0 Z`}
          fill="var(--torn-bg-top, #FAF6EE)"
        />
      </svg>
    </div>
  );
}

function TornEdgeBottom() {
  return (
    <div className="journey-torn-svg-wrapper journey-torn-svg-wrapper--bottom">
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="journey-torn-svg"
        aria-hidden="true"
      >
        <path
          d={`M0 40 L0 10 
            C4 11, 8 8, 12 9 C16 10, 20 7, 24 8 C28 9, 30 12, 34 11 
            C38 10, 42 13, 46 12 C50 11, 54 8, 58 9 C62 10, 64 7, 68 8 
            C72 9, 76 12, 80 11 C84 10, 88 13, 92 12 C96 11, 100 8, 104 9 
            C108 10, 112 7, 116 6 C120 5, 124 8, 128 9 C132 10, 136 13, 140 12 
            C144 11, 148 8, 152 9 C156 10, 160 13, 164 12 C168 11, 172 9, 176 10 
            C180 11, 184 8, 188 7 C192 6, 196 9, 200 10 C204 11, 208 8, 212 7 
            C216 6, 220 9, 224 10 C228 11, 232 13, 236 12 C240 11, 244 8, 248 9 
            C252 10, 256 7, 260 8 C264 9, 268 12, 272 11 C276 10, 280 7, 284 8 
            C288 9, 292 6, 296 7 C300 8, 304 11, 308 10 C312 9, 316 12, 320 11 
            C324 10, 328 7, 332 8 C336 9, 340 6, 344 7 C348 8, 352 11, 356 10 
            C360 9, 364 12, 368 11 C372 10, 376 8, 380 9 C384 10, 388 7, 392 8 
            C396 9, 400 12, 404 11 C408 10, 412 13, 416 12 C420 11, 424 8, 428 9 
            C432 10, 436 7, 440 6 C444 5, 448 8, 452 9 C456 10, 460 13, 464 12 
            C468 11, 472 8, 476 9 C480 10, 484 7, 488 8 C492 9, 496 12, 500 11 
            C504 10, 508 7, 512 8 C516 9, 520 6, 524 7 C528 8, 532 11, 536 10 
            C540 9, 544 12, 548 11 C552 10, 556 7, 560 8 C564 9, 568 6, 572 7 
            C576 8, 580 11, 584 10 C588 9, 592 12, 596 11 C600 10, 604 8, 608 9 
            C612 10, 616 7, 620 8 C624 9, 628 12, 632 11 C636 10, 640 13, 644 12 
            C648 11, 652 8, 656 9 C660 10, 664 7, 668 6 C672 5, 676 8, 680 9 
            C684 10, 688 13, 692 12 C696 11, 700 8, 704 9 C708 10, 712 7, 716 8 
            C720 9, 724 12, 728 11 C732 10, 736 7, 740 8 C744 9, 748 6, 752 7 
            C756 8, 760 11, 764 10 C768 9, 772 12, 776 11 C780 10, 784 7, 788 8 
            C792 9, 796 6, 800 7 C804 8, 808 11, 812 10 C816 9, 820 12, 824 11 
            C828 10, 832 8, 836 9 C840 10, 844 7, 848 8 C852 9, 856 12, 860 11 
            C864 10, 868 13, 872 12 C876 11, 880 8, 884 9 C888 10, 892 7, 896 6 
            C900 5, 904 8, 908 9 C912 10, 916 13, 920 12 C924 11, 928 8, 932 9 
            C936 10, 940 7, 944 8 C948 9, 952 12, 956 11 C960 10, 964 7, 968 8 
            C972 9, 976 6, 980 7 C984 8, 988 11, 992 10 C996 9, 1000 12, 1004 11 
            C1008 10, 1012 7, 1016 8 C1020 9, 1024 6, 1028 7 C1032 8, 1036 11, 1040 10 
            C1044 9, 1048 12, 1052 11 C1056 10, 1060 8, 1064 9 C1068 10, 1072 7, 1076 8 
            C1080 9, 1084 12, 1088 11 C1092 10, 1096 13, 1100 12 C1104 11, 1108 8, 1112 9 
            C1116 10, 1120 7, 1124 6 C1128 5, 1132 8, 1136 9 C1140 10, 1144 13, 1148 12 
            C1152 11, 1156 8, 1160 9 C1164 10, 1168 7, 1172 8 C1176 9, 1180 12, 1184 11 
            C1188 10, 1192 7, 1196 8 C1200 9, 1200 10, 1200 10
            L1200 40 Z`}
          fill="var(--torn-bg-bottom, #ffffff)"
        />
      </svg>
    </div>
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

"use client";

import React from "react";
import Link from "next/link";
import { Sprout, ShoppingBasket, ArrowRight } from "lucide-react";

/**
 * Film strip slides — images, title, subtitle, CTA text
 */
const FILM_SLIDES = [
  { img: "/images/film-strip/1.png" },
  { img: "/images/film-strip/2.png" },
  { img: "/images/film-strip/3.png" },
  { img: "/images/film-strip/4.png" },
  { img: "/images/film-strip/5.png" },
  { img: "/images/film-strip/6.png" },
  { img: "/images/film-strip/7.png" },
  { img: "/images/film-strip/8.png" },
];

/**
 * HeroBanner — Full-width hero section "Từ nông trại đến bàn ăn"
 * Layout: Text (left) | Mascot (center-right) | Film Strip (right edge)
 */
export default function HeroBanner() {
  return (
    <section className="hero-section" id="hero">
      {/* Background image */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-overlay" />
      </div>

      {/* FULL HEIGHT FILM STRIP */}
      <div className="hero-film-strip" aria-hidden="true">
        {/* Sprocket holes */}
        <div className="film-sprocket film-sprocket--left" />
        <div className="film-sprocket film-sprocket--right" />

        <div className="film-viewport">
          <div className="film-track">
            {/* Duplicate slides for seamless infinite loop */}
            {[...FILM_SLIDES, ...FILM_SLIDES].map((slide, i) => (
              <div className="film-frame" key={i}>
                <img
                  src={slide.img}
                  alt=""
                  className="film-frame-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content — 2 columns 1:1 */}
      <div className="hero-content">
        {/* LEFT (50%) — Text block */}
        <div className="hero-left">
          <div className="hero-text">
            <h1 className="hero-heading">
              Từ nông trại
              <br />
              <span className="hero-heading-accent">
                Đến bàn ăn
                {/* SVG hand-drawn underline */}
                <svg
                  className="hero-underline"
                  viewBox="0 0 280 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8.5C30 3 60 2.5 90 4C120 5.5 150 3 180 5C210 7 240 4 278 7"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="hero-desc">
              Cạp Nông kết nối nông dân với người tiêu dùng.
              <br />
              Mang nông sản tươi ngon, minh bạch và bền vững.
            </p>

            <div className="hero-cta-group">
              <Link href="/home#journey" className="hero-cta hero-cta--primary">
                <Sprout className="w-5 h-5" />
                <span>Khám phá hành trình</span>
              </Link>
              <Link href="/catalog" className="hero-cta hero-cta--outline">
                <ShoppingBasket className="w-5 h-5" />
                <span>Mua sắm ngay</span>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT (50%) — Mascot */}
        <div className="hero-right">
          <div className="hero-mascot" aria-hidden="true">
            <img
              src="/images/mascot/sticker-4.svg"
              alt=""
              className="hero-mascot-img"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

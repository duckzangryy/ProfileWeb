import type React from "react";
import Script from "next/script";
import AntiInspect from '@/components/anti-inspect';
import AntiDdosShield from '@/components/anti-ddos-shield';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], display: "swap", preload: true });
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", preload: false });

export const metadata: Metadata = {
  title: "Vuong Viet Anh - Personal Portfolio",
  description:
    "Mot chut ve Viet Anh - Personal introduction, hobbies, and social media from Buon Ma Thuot, Viet Nam.",
  generator: "v0.app",
  keywords: [
    "Vuong Viet Anh",
    "Portfolio",
    "Personal Blog",
    "vuongvietanh",
    "vietanh",
    "vuong viet anh",
  ],
  authors: [{ name: "Vuong Viet Anh" }],
  openGraph: {
    title: "Vuong Viet Anh - Personal Portfolio",
    description: "~/mot chut ve toi - Vuong Viet Anh",
    url: "https://your-domain.com",
    siteName: "Vuong Viet Anh Portfolio",
    images: [
      {
        url: "/avatar.jpeg",
        width: 800,
        height: 600,
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vuong Viet Anh - Personal Portfolio",
    description:
      "Mot chut ve Viet Anh - Personal introduction, hobbies, and social media.",
    images: ["/avatar.jpeg"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geist.className} scroll-smooth max-lg:overflow-y-auto lg:overflow-hidden`}>
      <head />
      {/*
        suppressHydrationWarning trên <body>:
        inline script bên dưới sẽ set data-shield="pending" trước khi
        React hydrate → React thấy mismatch attr → warning.
        suppressHydrationWarning tắt warning đó đi, an toàn vì đây là
        intentional client-only mutation.
      */}
      <body
        suppressHydrationWarning
        className="antialiased bg-[#050510] text-white selection:bg-purple-500/30 min-h-dvh max-lg:overflow-x-hidden max-lg:overflow-y-auto lg:h-dvh lg:overflow-hidden"
      >
        {/*
          Script đặt ĐẦU <body> (không phải <head>) để document.body đã tồn tại.
          Chạy synchronous → set data-shield trước khi browser paint bất cứ thứ gì.
          CSS visibility:hidden ẩn toàn bộ content phía sau.
        */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var val=localStorage.getItem('pw_shield_ok');if(!val||Date.now()-Number(val)>30*60*1000)document.body.setAttribute('data-shield','pending')}catch(e){document.body.setAttribute('data-shield','pending')}})();`,
            }}
          />

        <AntiDdosShield />
        <AntiInspect />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
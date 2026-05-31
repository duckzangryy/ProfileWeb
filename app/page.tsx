"use client"
import React, { useState, useEffect } from 'react'
import Image from "next/image"
import dynamic from "next/dynamic"
import { 
  MapPin, Heart, Moon, Headphones, Globe, Instagram, MessageCircle, Clapperboard, Music2, Facebook
} from "lucide-react"

const VisitorInfo = dynamic(() => import("@/components/visitor-info"), { ssr: false })
const SpeedMonitor = dynamic(() => import("@/components/speed-monitor"), { ssr: false })
const MediaPlayer = dynamic(() => import("@/components/media-player"), { ssr: false })

const buonMaThuotImages = [
  { src: "/0L3A3930.webp", title: "#1", desc: "Ki yeu - xau chai" },
  { src: "/0L3A3929.webp", title: "#2", desc: "Ki yeu - xau chai" },
  { src: "/IMG_20260122_205334.webp", title: "#3", desc: "Cai anh tu 2023 thi phai..." },
  { src: "/TAIT3957.webp", title: "#4", desc: "Cute pho mai que vkl" },
]

const personalHobbies = [
  { name: "Ngủ", icon: Moon, color: "from-indigo-500/30 to-purple-500/30", border: "border-indigo-500/40", text: "text-indigo-300" },
  { name: "Phim", icon: Clapperboard, color: "from-rose-500/30 to-pink-500/30", border: "border-rose-500/40", text: "text-rose-300" },
  { name: "Nhạc", icon: Headphones, color: "from-emerald-500/30 to-teal-500/30", border: "border-emerald-500/40", text: "text-emerald-300" },
  { name: "Em", icon: Heart, color: "from-red-500/30 via-pink-500/30 to-rose-500/30", border: "border-red-400/50", text: "text-red-200" },
]

const socialMedia = [
  { name: "Instagram", icon: Instagram, url: "https://www.instagram.com/_awsci/", color: "from-pink-500/30 to-orange-500/30", border: "border-pink-500/40", text: "text-pink-300" },
  { name: "Facebook", icon: Facebook, url: "https://www.facebook.com/vanhzxje.2018", color: "from-blue-500/30 to-blue-600/30", border: "border-blue-500/40", text: "text-blue-300" },
  { name: "Soundcloud", icon: Music2, url: "https://soundcloud.com/bfmaterial-maybe", color: "from-orange-500/30 to-amber-500/30", border: "border-orange-500/40", text: "text-orange-200" },
  { name: "Discord", icon: MessageCircle, url: "https://discordapp.com/users/633049802036346911", color: "from-indigo-500/30 to-violet-500/30", border: "border-indigo-500/40", text: "text-indigo-300" },
]

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`glass-effect ios-rounded-xl p-0.5 perf-card ${className}`}>
      <div className="glass-effect-light ios-rounded-xl p-4 sm:p-5">{children}</div>
    </div>
  )
}

/** Vùng con đang cuộn được (playlist, v.v.) — nếu còn chỗ cuộn theo hướng wheel */
function getActiveScrollable(el: HTMLElement | null, deltaY: number): HTMLElement | null {
  let node: HTMLElement | null = el
  while (node) {
    const { overflowY } = getComputedStyle(node)
    const canScroll =
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      node.scrollHeight > node.clientHeight + 1

    if (canScroll) {
      const atTop = node.scrollTop <= 0
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1
      if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) {
        return node
      }
    }
    node = node.parentElement
  }
  return null
}

export default function PersonalIntro() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    const startInterval = () => {
      intervalId = setInterval(() => {
        if (!document.hidden) {
          setCurrentImageIndex((prev) => (prev + 1) % buonMaThuotImages.length)
        }
      }, 5000)
    }
    startInterval()
    const handleVisibilityChange = () => {
      clearInterval(intervalId)
      if (!document.hidden) startInterval()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Desktop: lăn chuột bất kỳ đâu → cuộn cột phải (trừ playlist đang cuộn riêng)
  useEffect(() => {
    const shell = document.querySelector(".page-shell")
    if (!shell) return

    let pendingDelta = 0
    let rafId = 0

    const flushScroll = () => {
      rafId = 0
      const panel = document.getElementById("profile-scroll")
      if (panel && pendingDelta !== 0) {
        panel.scrollTop += pendingDelta
        pendingDelta = 0
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth < 1024) return

      const panel = document.getElementById("profile-scroll")
      if (!panel || panel.scrollHeight <= panel.clientHeight + 1) return

      const target = e.target instanceof HTMLElement ? e.target : null
      if (!target) return

      if (getActiveScrollable(target, e.deltaY)) return

      if (panel.contains(target)) {
        const atTop = panel.scrollTop <= 0
        const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return
      }

      e.preventDefault()
      pendingDelta += e.deltaY
      if (!rafId) rafId = requestAnimationFrame(flushScroll)
    }

    shell.addEventListener("wheel", onWheel, { passive: false, capture: true })
    return () => {
      shell.removeEventListener("wheel", onWheel, { capture: true })
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="page-shell min-h-dvh relative max-lg:overflow-visible lg:h-dvh lg:overflow-hidden">
      <div className="fixed inset-0 bg-ambient-purple pointer-events-none" aria-hidden />

      <div className="relative z-10 w-full p-3 sm:p-4 lg:p-6 lg:h-full lg:min-h-0">
        <div className="max-w-7xl mx-auto w-full h-full lg:min-h-0 lg:flex lg:flex-col">
          <div className="page-grid grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5 lg:flex-1 lg:min-h-0 lg:h-full">

            {/* Cột trái: gallery */}
            <div className="gallery-col flex flex-col gap-2 sm:gap-3 lg:min-h-0 lg:h-full">
              <div className="glass-effect ios-rounded-xl p-0.5 flex-1 min-h-0 overflow-hidden">
                <div className="glass-effect-light ios-rounded-xl p-2 sm:p-3 h-full relative overflow-hidden">
                  <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-0 ios-rounded-lg overflow-hidden">
                    {buonMaThuotImages.map((img, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 gpu-smooth transition-opacity duration-700 ease-out ${
                          index === currentImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                      >
                        {index === currentImageIndex && (
                          <Image
                            src={img.src}
                            alt={img.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            quality={85}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5">
                          <h3 className="text-white text-2xl font-semibold drop-shadow-lg">{img.title}</h3>
                          <p className="text-white/80 drop-shadow-md text-sm mt-1">{img.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                    {buonMaThuotImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-1.5 rounded-full transition-gpu ${
                          index === currentImageIndex ? 'bg-white w-8' : 'bg-white/30 w-2 hover:bg-white/50'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 shrink-0">
                {buonMaThuotImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`glass-effect glass-effect-interactive ios-rounded-xl transition-gpu hover:scale-105 group relative overflow-hidden ${
                      index === currentImageIndex
                        ? 'border-white/50 shadow-lg scale-105 z-10'
                        : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/20'
                    }`}
                    aria-label={`View ${img.title}`}
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src={img.src}
                        alt={img.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 1024px) 25vw, 150px"
                        quality={60}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cột phải — một vùng cuộn, không chồng lớp */}
            <div className="profile-col flex flex-col gap-3 lg:min-h-0 lg:h-full lg:overflow-hidden">
              <div
                id="profile-scroll"
                className="profile-scroll relative z-0 flex flex-col gap-3 max-lg:overflow-visible lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain no-scrollbar lg:pr-0.5"
              >

              <GlassCard>
                <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
                  <div className="glass-effect ios-rounded-full p-0.5 overflow-hidden">
                    <div className="glass-effect-light ios-rounded-full p-1 overflow-hidden">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 ios-rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center animate-glow motion-reduce:animate-none overflow-hidden relative">
                        <Image
                          src="/avatar.jpeg"
                          alt="Avatar"
                          fill
                          sizes="96px"
                          className="object-cover ios-rounded-full"
                          priority
                          quality={80}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Vuong Viet Anh</h1>
                    <p className="text-gradient-ios font-medium text-base sm:text-lg mt-1 italic">duckhayangry@gmail.com</p>
                    <div className="flex items-center justify-center gap-2 mt-2 text-white/60 text-sm">
                      <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span>Buon Ma Thuot, Viet Nam</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <h2 className="text-base sm:text-lg font-semibold text-white/90 mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-400 shrink-0" />
                  Description
                </h2>
                <p className="text-white/70 leading-relaxed text-xs sm:text-sm">
                  Khi màn đêm buông xuống thì cũng là lúc mà nỗi buồn vây kín trong anh, dẫu biết đối với em thì anh chả là gì cả nhưng nụ cười của nàng lại là ngọn đèn soi tỏa ánh ban đêm. Là tất cả của cuộc đời anh....
                </p>
              </GlassCard>

                <div className="grid grid-cols-2 gap-3">
                  <GlassCard>
                    <h2 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center border border-pink-500/30">
                        <Heart className="h-3 w-3 text-pink-400" />
                      </div>
                      <span>Interest</span>
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {personalHobbies.map((hobby, index) => {
                        const Icon = hobby.icon
                        return (
                          <div
                            key={index}
                            className={`flex flex-col items-center justify-center p-3.5 text-center ios-rounded-lg border border-white/10 ${hobby.text}`}
                          >
                            <div className={`w-10 h-10 ios-rounded-lg flex items-center justify-center mb-2.5 ${hobby.color} border ${hobby.border}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-medium truncate w-full">{hobby.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <h2 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                        <Globe className="h-3 w-3 text-cyan-400" />
                      </div>
                      <span>Social Media</span>
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {socialMedia.map((social, index) => {
                        const Icon = social.icon
                        return (
                          <a
                            key={index}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex flex-col items-center justify-center p-3.5 text-center ios-rounded-lg border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] ${social.text}`}
                          >
                            <div className={`w-10 h-10 ios-rounded-lg flex items-center justify-center mb-2.5 ${social.color} border ${social.border}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-medium truncate w-full">{social.name}</span>
                          </a>
                        )
                      })}
                    </div>
                  </GlassCard>
                </div>

                {/* Location + Network | Music */}
                <div className="stats-panel-grid grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-stretch">
                  <div className="flex flex-col gap-3">
                    <GlassCard>
                      <h2 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-cyan-400" />
                        Your Location
                      </h2>
                      <VisitorInfo />
                    </GlassCard>
                    <GlassCard>
                      <h2 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-emerald-400" />
                        Network
                      </h2>
                      <SpeedMonitor />
                    </GlassCard>
                  </div>

                  <GlassCard className="music-panel lg:self-stretch">
                    <h2 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-400" />
                      Music
                    </h2>
                    <MediaPlayer />
                  </GlassCard>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

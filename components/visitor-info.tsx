"use client"
import React, { useState, useEffect, memo } from 'react'
import { Globe, MapPin, Clock, Smartphone, Monitor } from "lucide-react"

const VisitorInfo = memo(() => {
  const [visitorData, setVisitorData] = useState({
    ip: "Dang tai...",
    city: "Dang tai...",
    country: "Dang tai...",
    timezone: "Dang tai...",
    device: "Unknown",
    browser: "Unknown",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getDeviceInfo = () => {
        const ua = navigator.userAgent;
        let device = "Desktop";
        let browser = "Unknown";
        const isTouch = navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
        const isNarrow = window.innerWidth < 1024;

        if (/iPhone/i.test(ua)) {
            device = "iPhone";
        } else if (/iPad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
            device = "iPad";
        } else if (/Android/i.test(ua)) {
            device = /Mobile/i.test(ua) ? "Android" : "Tablet";
        } else if (/Tablet|iPad/i.test(ua)) {
            device = "Tablet";
        } else if (/Mobile/i.test(ua)) {
            device = "Mobile";
        } else if (isTouch && isNarrow) {
            device = "Mobile";
        }
    
        // 2. Kiểm tra trình duyệt (giữ lại logic cũ của cậu)
        if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Edg")) browser = "Edge";
        else if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Safari")) browser = "Safari";
    
        return { device, browser };
    }

    const fetchIPInfo = async () => {
      const deviceInfo = getDeviceInfo()
      
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        const ip = ipData.ip

        try {
          const geoResponse = await fetch(`https://ipinfo.io/${ip}/json`)
          const geoData = await geoResponse.json()
          
          setVisitorData({
            ip,
            city: geoData.city || "N/A",
            country: geoData.country || "N/A",
            timezone: geoData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            ...deviceInfo
          })
        } catch {
          setVisitorData({
            ip,
            city: "N/A",
            country: "N/A",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ...deviceInfo
          })
        }
        setIsLoading(false)
      } catch {
        const deviceInfo = getDeviceInfo()
        setVisitorData({
          ip: "Khong xac dinh",
          city: "N/A",
          country: "N/A",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...deviceInfo
        })
        setIsLoading(false)
      }
    }

    fetchIPInfo()
  }, [])

  const infoItems = [
    { icon: Globe, label: "IP", value: visitorData.ip },
    { icon: MapPin, label: "Vi tri", value: `${visitorData.city}, ${visitorData.country}` },
    { icon: Clock, label: "Timezone", value: visitorData.timezone },
    { icon: Smartphone, label: "Thiet bi", value: visitorData.device },
    { icon: Monitor, label: "Trinh duyet", value: visitorData.browser },
  ]

  return (
    <div className="space-y-2">
      {infoItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2 text-xs group">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-all duration-300">
            <item.icon className="h-3 w-3 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm text-white/80 truncate ${isLoading ? 'animate-pulse' : ''}`}>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
})
VisitorInfo.displayName = 'VisitorInfo'

export default VisitorInfo

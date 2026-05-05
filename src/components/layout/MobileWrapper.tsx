"use client";

import React, { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import "@/styles/mobile.css";

interface MobileWrapperProps {
  children: React.ReactNode;
}

export default function MobileWrapper({ children }: MobileWrapperProps) {
  useEffect(() => {
    const setupMobile = async () => {
      if (Capacitor.isNativePlatform()) {
        // Hide splash screen
        await SplashScreen.hide();
        
        // Set status bar style
        await StatusBar.setStyle({ style: Style.Light });
        
        // Set status bar background (iOS only)
        if (Capacitor.getPlatform() === 'ios') {
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }
      }
    };

    setupMobile();
  }, []);

  // Add mobile-specific classes
  const mobileClasses = Capacitor.isNativePlatform() 
    ? "mobile-app safe-area-top safe-area-bottom" 
    : "";

  return (
    <div className={`min-h-screen ${mobileClasses}`}>
      {children}
    </div>
  );
}

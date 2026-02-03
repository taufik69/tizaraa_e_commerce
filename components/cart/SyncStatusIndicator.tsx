// components/cart/SyncStatusIndicator.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/features/store/hooks/hooks";
import { selectSyncStatus } from "@/features/slices/cartSelectors";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export default function SyncStatusIndicator() {
  const syncStatus = useAppSelector(selectSyncStatus);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (syncStatus === "syncing") {
      setShowIndicator(true);
    } else if (syncStatus === "synced") {
      // Show "synced" for 2 seconds then hide
      setShowIndicator(true);
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (syncStatus === "error") {
      setShowIndicator(true);
    }
  }, [syncStatus]);

  if (!showIndicator) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
      {syncStatus === "syncing" && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Syncing...</span>
        </div>
      )}

      {syncStatus === "synced" && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg">
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Synced across tabs</span>
        </div>
      )}

      {syncStatus === "error" && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Sync error</span>
        </div>
      )}
    </div>
  );
}

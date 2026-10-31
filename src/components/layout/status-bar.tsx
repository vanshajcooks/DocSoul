"use client";

import React from "react";
import { NetworkStatus, SaveStatus } from "@/types/document";
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatusBarProps {
  networkStatus: NetworkStatus;
  saveStatus: SaveStatus;
  lastSavedAt?: number;
}

export function StatusBar({
  networkStatus,
  saveStatus,
  lastSavedAt,
}: StatusBarProps) {
  const isOnline = networkStatus === "online";

  const formattedTime = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Just now";

  return (
    <TooltipProvider delay={150}>
      <div className="flex items-center gap-2">
        {/* Network Status Indicator */}
        <Tooltip>
          <TooltipTrigger render={<div className="cursor-pointer" />}>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isOnline
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                  : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
              }`}
            >
              <span
                className={`relative flex h-2 w-2 rounded-full ${
                  isOnline ? "bg-emerald-500" : "bg-amber-500"
                }`}
              >
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
              </span>
              {isOnline ? (
                <span className="flex items-center gap-1">
                  <Wifi className="size-3" />
                  <span>Online</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WifiOff className="size-3" />
                  <span>Offline Mode</span>
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {isOnline
              ? "Connected to network. Local-first sync ready."
              : "No internet connection. All changes are securely preserved locally."}
          </TooltipContent>
        </Tooltip>

        {/* Save Status Indicator */}
        <Tooltip>
          <TooltipTrigger render={<div className="cursor-pointer" />}>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-zinc-600 bg-zinc-100/80 border border-zinc-200/80 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/60 transition-colors">
              {saveStatus === "saving" && (
                <>
                  <RefreshCw className="size-3 animate-spin text-zinc-500" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Saved</span>
                </>
              )}
              {saveStatus === "offline-cached" && (
                <>
                  <HardDrive className="size-3 text-sky-600 dark:text-sky-400" />
                  <span>Saved to device</span>
                </>
              )}
              {saveStatus === "unsaved" && (
                <>
                  <AlertCircle className="size-3 text-amber-500" />
                  <span>Unsaved changes</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {saveStatus === "saving" && "Writing changes to local memory..."}
            {saveStatus === "saved" && `Last saved at ${formattedTime}`}
            {saveStatus === "offline-cached" &&
              `Persistent local storage active. Last saved at ${formattedTime}`}
            {saveStatus === "unsaved" && "Modifications pending save"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

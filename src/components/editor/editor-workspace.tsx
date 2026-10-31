"use client";

import React, { useState, useEffect } from "react";
import { DocumentData, SaveStatus, NetworkStatus } from "@/types/document";
import { StatusBar } from "@/components/layout/status-bar";
import { TipTapEditor } from "./tiptap-editor";
import {
  Star,
  Clock,
  Sparkles,
  FileText,
  Share2,
  MoreHorizontal,
  ChevronRight,
  Smile,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EMOJI_OPTIONS = ["📄", "✨", "🧠", "🚀", "💡", "📝", "⚡", "🎯", "📌", "🔥"];

interface EditorWorkspaceProps {
  document: DocumentData;
  networkStatus: NetworkStatus;
  saveStatus: SaveStatus;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onUpdateIcon: (id: string, newIcon: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateContent: (id: string, newContent: string, wordCount: number) => void;
}

export function EditorWorkspace({
  document,
  networkStatus,
  saveStatus,
  onUpdateTitle,
  onUpdateIcon,
  onToggleFavorite,
  onUpdateContent,
}: EditorWorkspaceProps) {
  const [title, setTitle] = useState(document.title);
  const [wordCount, setWordCount] = useState(0);

  // Synchronize title if document changes externally
  useEffect(() => {
    setTitle(document.title);
  }, [document.id, document.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    onUpdateTitle(document.id, val);
  };

  const handleContentChange = (newContent: string, count: number) => {
    setWordCount(count);
    onUpdateContent(document.id, newContent, count);
  };

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col flex-1 h-full min-w-0 bg-white dark:bg-zinc-950">
      {/* Top Navigation & Status Bar */}
      <header className="h-12 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-4 sm:px-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xs select-none">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 min-w-0">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">SoulDocs</span>
          <ChevronRight className="size-3 text-zinc-400" />
          <span className="truncate max-w-[200px] sm:max-w-xs font-medium text-zinc-900 dark:text-zinc-100">
            {document.icon || "📄"} {title || "Untitled"}
          </span>
        </div>

        {/* Status Indicators & Document Actions */}
        <div className="flex items-center gap-3">
          <StatusBar
            networkStatus={networkStatus}
            saveStatus={saveStatus}
            lastSavedAt={document.updatedAt}
          />

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Favorite Toggle */}
          <button
            onClick={() => onToggleFavorite(document.id)}
            className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
              document.isFavorite
                ? "text-amber-500 fill-amber-500"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
            title={document.isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-label="Toggle favorite"
          >
            <Star className={`size-4 ${document.isFavorite ? "fill-amber-400 text-amber-500" : ""}`} />
          </button>
        </div>
      </header>

      {/* Document Canvas Header (Notion Inspired) */}
      <div className="px-6 pt-8 pb-4 md:px-16 max-w-3xl w-full mx-auto">
        {/* Icon & Icon Picker */}
        <div className="mb-3 group relative inline-block">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="text-4xl hover:scale-105 transition-transform p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer"
                  title="Change document icon"
                />
              }
            >
              <span>{document.icon || "📄"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 grid grid-cols-5 gap-1 min-w-[200px]">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onUpdateIcon(document.id, emoji)}
                  className="text-xl p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center cursor-pointer transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Document Title Input */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Document"
          className="w-full text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 bg-transparent border-none outline-none focus:ring-0 p-0"
        />

        {/* Metadata subline */}
        <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500 mt-2 select-none">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            <span>Updated {new Date(document.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
          <span>•</span>
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{readingTime} min read</span>
        </div>
      </div>

      {/* TipTap Rich Editor */}
      <TipTapEditor
        key={document.id}
        documentId={document.id}
        initialContent={document.content}
        onContentChange={handleContentChange}
      />
    </div>
  );
}

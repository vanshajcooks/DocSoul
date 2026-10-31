"use client";

import React, { useState, useRef, useEffect } from "react";
import { DocumentMeta } from "@/types/document";
import {
  Plus,
  Search,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  HardDrive,
  Edit3,
  MoreVertical,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  documents: DocumentMeta[];
  activeDocumentId: string;
  onSelectDocument: (id: string) => void;
  onCreateDocument: () => void;
  onRenameDocument: (id: string, newTitle: string) => void;
  onDeleteDocument: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  documents,
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  onRenameDocument,
  onDeleteDocument,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteDocuments = filteredDocuments.filter((doc) => doc.isFavorite);
  const otherDocuments = filteredDocuments.filter((doc) => !doc.isFavorite);

  if (isCollapsed) {
    return (
      <aside className="w-14 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-925 flex flex-col items-center py-3 justify-between transition-all select-none">
        <div className="flex flex-col items-center gap-3">
          <TooltipProvider delay={100}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={onToggleCollapse}
                    className="p-2 rounded-lg hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    aria-label="Expand sidebar"
                  />
                }
              >
                <ChevronRight className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={onCreateDocument}
                    className="p-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    aria-label="New Document"
                  />
                }
              >
                <Plus className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right">New Document</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

          {/* Icon list of recent docs */}
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[60vh] no-scrollbar">
            {documents.slice(0, 10).map((doc) => (
              <TooltipProvider key={doc.id} delay={100}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={() => onSelectDocument(doc.id)}
                        className={`size-9 rounded-lg flex items-center justify-center text-sm transition-colors cursor-pointer ${
                          doc.id === activeDocumentId
                            ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
                        }`}
                      />
                    }
                  >
                    <span>{doc.icon || "📄"}</span>
                  </TooltipTrigger>
                  <TooltipContent side="right">{doc.title}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-zinc-400 font-mono">SD</div>
      </aside>
    );
  }

  return (
    <aside className="w-64 sm:w-72 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-925 flex flex-col justify-between transition-all select-none">
      {/* Top Branding & Action */}
      <div className="flex flex-col p-3 gap-3">
        {/* Branding */}
        <div className="flex items-center justify-between px-1.5 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-linear-to-br from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center text-white dark:text-zinc-950 font-bold shadow-xs">
              <Sparkles className="size-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  SoulDocs
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  MVP
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-none mt-0.5">
                Offline-First Workspace
              </p>
            </div>
          </div>

          <TooltipProvider delay={200}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={onToggleCollapse}
                    className="p-1 rounded-md hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
                    aria-label="Collapse sidebar"
                  />
                }
              >
                <ChevronLeft className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="bottom">Collapse sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* New Document Button */}
        <button
          onClick={onCreateDocument}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Plus className="size-3.5 transition-transform group-hover:rotate-90 duration-150" />
            <span>New Document</span>
          </div>
          <kbd className="text-[10px] font-mono bg-zinc-800 dark:bg-zinc-200 px-1.5 py-0.5 rounded opacity-75">
            +
          </kbd>
        </button>

        {/* Search input */}
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-zinc-100/90 dark:bg-zinc-800/60 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 no-scrollbar">
        {/* Favorites Section */}
        {favoriteDocuments.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase flex items-center gap-1.5">
              <Star className="size-3 fill-amber-400/40 text-amber-500" />
              <span>Favorites</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {favoriteDocuments.map((doc) => (
                <DocumentListItem
                  key={doc.id}
                  doc={doc}
                  isActive={doc.id === activeDocumentId}
                  onSelect={() => onSelectDocument(doc.id)}
                  onRename={(newTitle) => onRenameDocument(doc.id, newTitle)}
                  onDelete={() => onDeleteDocument(doc.id)}
                  canDelete={documents.length > 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Documents Section */}
        <div>
          <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase flex items-center gap-1.5">
            <BookOpen className="size-3" />
            <span>All Documents</span>
            <span className="text-[10px] font-mono ml-auto text-zinc-400">
              {filteredDocuments.length}
            </span>
          </div>
          <div className="space-y-0.5 mt-1">
            {otherDocuments.map((doc) => (
              <DocumentListItem
                key={doc.id}
                doc={doc}
                isActive={doc.id === activeDocumentId}
                onSelect={() => onSelectDocument(doc.id)}
                onRename={(newTitle) => onRenameDocument(doc.id, newTitle)}
                onDelete={() => onDeleteDocument(doc.id)}
                canDelete={documents.length > 1}
              />
            ))}
            {filteredDocuments.length === 0 && (
              <div className="text-center py-6 px-3 text-xs text-zinc-400">
                No matching documents found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HardDrive className="size-3.5 text-zinc-400" />
            <span className="text-[11px] font-medium">Local-First Storage</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
            Active
          </span>
        </div>
      </div>
    </aside>
  );
}

interface DocumentListItemProps {
  doc: DocumentMeta;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  canDelete: boolean;
}

function DocumentListItem({
  doc,
  isActive,
  onSelect,
  onRename,
  onDelete,
  canDelete,
}: DocumentListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(doc.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(doc.title);
  }, [doc.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleFinishRename = () => {
    setIsEditing(false);
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== doc.title) {
      onRename(trimmed);
    } else {
      setEditTitle(doc.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFinishRename();
    } else if (e.key === "Escape") {
      setEditTitle(doc.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
        isActive
          ? "bg-zinc-200/90 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium shadow-2xs"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-sm shrink-0">{doc.icon || "📄"}</span>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleFinishRename}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
          />
        ) : (
          <span className="truncate">{doc.title || "Untitled Document"}</span>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded hover:bg-zinc-300/60 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                  aria-label="Document options"
                />
              }
            >
              <MoreVertical className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 p-1">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="text-xs cursor-pointer gap-2"
              >
                <Edit3 className="size-3.5 text-zinc-500" />
                <span>Rename</span>
              </DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-xs cursor-pointer gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

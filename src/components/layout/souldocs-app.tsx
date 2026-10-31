"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { DocumentData, SaveStatus } from "@/types/document";
import { INITIAL_DOCUMENTS } from "@/lib/initial-documents";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { Sidebar } from "@/components/sidebar/sidebar";
import { EditorWorkspace } from "@/components/editor/editor-workspace";

export function SoulDocsApp() {
  const [mounted, setMounted] = useState(false);
  const [documents, setDocuments] = useState<DocumentData[]>(INITIAL_DOCUMENTS);
  const [activeDocId, setActiveDocId] = useState<string>(INITIAL_DOCUMENTS[0].id);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  const networkStatus = useNetworkStatus();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // SSR hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerSaveTransition = useCallback(() => {
    setSaveStatus("saving");
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus(networkStatus === "offline" ? "offline-cached" : "saved");
    }, 350);
  }, [networkStatus]);

  const activeDocument =
    documents.find((doc) => doc.id === activeDocId) || documents[0];

  // Document Switching
  const handleSelectDocument = (id: string) => {
    setActiveDocId(id);
    setSaveStatus("saved");
  };

  // Document Creation
  const handleCreateDocument = () => {
    const newDocId = `doc-${Date.now()}`;
    const newDoc: DocumentData = {
      id: newDocId,
      title: "Untitled Document",
      icon: "📝",
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: "<p></p>",
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDocId);
    setSaveStatus("saved");
  };

  // Document Renaming
  const handleRenameDocument = (id: string, newTitle: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? { ...doc, title: newTitle, updatedAt: Date.now() }
          : doc
      )
    );
    triggerSaveTransition();
  };

  // Document Deletion
  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => {
      if (prev.length <= 1) {
        // If deleting the only document, generate a clean new one immediately
        const replacementId = `doc-${Date.now()}`;
        const replacement: DocumentData = {
          id: replacementId,
          title: "New Document",
          icon: "📄",
          isFavorite: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          content: "<p></p>",
        };
        setActiveDocId(replacementId);
        return [replacement];
      }

      const updated = prev.filter((doc) => doc.id !== id);
      if (activeDocId === id) {
        setActiveDocId(updated[0].id);
      }
      return updated;
    });
    triggerSaveTransition();
  };

  // Document Icon Update
  const handleUpdateIcon = (id: string, newIcon: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? { ...doc, icon: newIcon, updatedAt: Date.now() }
          : doc
      )
    );
    triggerSaveTransition();
  };

  // Document Favorite Toggle
  const handleToggleFavorite = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
      )
    );
  };

  // Content Update
  const handleUpdateContent = (
    id: string,
    newContent: string,
    _wordCount: number
  ) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? { ...doc, content: newContent, updatedAt: Date.now() }
          : doc
      )
    );
    triggerSaveTransition();
  };

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <div className="size-2 rounded-full bg-zinc-400 animate-ping" />
          <span>Loading SoulDocs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Left Sidebar */}
      <Sidebar
        documents={documents}
        activeDocumentId={activeDocId}
        onSelectDocument={handleSelectDocument}
        onCreateDocument={handleCreateDocument}
        onRenameDocument={handleRenameDocument}
        onDeleteDocument={handleDeleteDocument}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Document Workspace */}
      <main className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {activeDocument ? (
          <EditorWorkspace
            key={activeDocument.id}
            document={activeDocument}
            networkStatus={networkStatus}
            saveStatus={saveStatus}
            onUpdateTitle={handleRenameDocument}
            onUpdateIcon={handleUpdateIcon}
            onToggleFavorite={handleToggleFavorite}
            onUpdateContent={handleUpdateContent}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-zinc-400 text-sm">
            No document selected.
          </div>
        )}
      </main>
    </div>
  );
}

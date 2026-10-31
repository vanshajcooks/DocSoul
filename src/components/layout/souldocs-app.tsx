"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { DocumentMeta, SaveStatus } from "@/types/document";
import { INITIAL_DOCUMENT_METAS, getInitialSeedContent } from "@/lib/initial-documents";
import {
  getOrInitializeDocuments,
  saveDocumentMeta,
  updateDocumentMeta,
  deleteDocumentMeta,
} from "@/lib/db";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { Sidebar } from "@/components/sidebar/sidebar";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

const ACTIVE_DOC_STORAGE_KEY = "souldocs_active_doc_id";

export function SoulDocsApp() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  const networkStatus = useNetworkStatus();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Dexie and restore persistent metadata on client
  useEffect(() => {
    setMounted(true);
    let active = true;

    async function initializeDatabase() {
      try {
        const loadedDocs = await getOrInitializeDocuments(INITIAL_DOCUMENT_METAS);
        if (!active) return;

        setDocuments(loadedDocs);

        // Restore active document from localStorage, or default to first document
        const storedActiveId =
          typeof window !== "undefined"
            ? localStorage.getItem(ACTIVE_DOC_STORAGE_KEY)
            : null;

        if (storedActiveId && loadedDocs.some((d) => d.id === storedActiveId)) {
          setActiveDocId(storedActiveId);
        } else if (loadedDocs.length > 0) {
          setActiveDocId(loadedDocs[0].id);
        }
      } catch (err) {
        console.error("[SoulDocs] Initialization error:", err);
        setSaveStatus("error");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    initializeDatabase();

    return () => {
      active = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Sync active document selection to localStorage
  const handleSelectDocument = (id: string) => {
    setActiveDocId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_DOC_STORAGE_KEY, id);
    }
    setSaveStatus(networkStatus === "offline" ? "offline-cached" : "saved");
  };

  // Document Creation
  const handleCreateDocument = async () => {
    const newDocId = `doc-${Date.now()}`;
    const newDocMeta: DocumentMeta = {
      id: newDocId,
      title: "Untitled Document",
      icon: "📝",
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      setSaveStatus("saving");
      await saveDocumentMeta(newDocMeta);
      setDocuments((prev) => [newDocMeta, ...prev]);
      handleSelectDocument(newDocId);
      setSaveStatus(networkStatus === "offline" ? "offline-cached" : "saved");
    } catch (err) {
      console.error("[SoulDocs] Error creating document:", err);
      setSaveStatus("error");
    }
  };

  // Document Renaming
  const handleRenameDocument = async (id: string, newTitle: string) => {
    const now = Date.now();
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, title: newTitle, updatedAt: now } : doc
      )
    );

    try {
      setSaveStatus("saving");
      await updateDocumentMeta(id, { title: newTitle, updatedAt: now });
      setSaveStatus(networkStatus === "offline" ? "offline-cached" : "saved");
    } catch (err) {
      console.error("[SoulDocs] Error renaming document:", err);
      setSaveStatus("error");
    }
  };

  // Document Icon Update
  const handleUpdateIcon = async (id: string, newIcon: string) => {
    const now = Date.now();
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, icon: newIcon, updatedAt: now } : doc
      )
    );

    try {
      await updateDocumentMeta(id, { icon: newIcon, updatedAt: now });
    } catch (err) {
      console.error("[SoulDocs] Error updating icon:", err);
    }
  };

  // Document Favorite Toggle
  const handleToggleFavorite = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    const newFav = !doc.isFavorite;

    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isFavorite: newFav } : d))
    );

    try {
      await updateDocumentMeta(id, { isFavorite: newFav });
    } catch (err) {
      console.error("[SoulDocs] Error toggling favorite:", err);
    }
  };

  // Document Deletion
  const handleDeleteDocument = async (id: string) => {
    try {
      // Delete metadata from Dexie
      await deleteDocumentMeta(id);

      // Clean up Yjs room in IndexedDB
      try {
        const tempDoc = new Y.Doc();
        const tempProv = new IndexeddbPersistence(`souldocs-doc-${id}`, tempDoc);
        await tempProv.clearData();
        tempProv.destroy();
        tempDoc.destroy();
      } catch (idbErr) {
        console.warn("[SoulDocs] Error cleaning up Yjs room:", idbErr);
      }

      setDocuments((prev) => {
        const remaining = prev.filter((doc) => doc.id !== id);

        if (remaining.length === 0) {
          // Fallback if all documents are deleted
          const fallbackId = `doc-${Date.now()}`;
          const fallbackMeta: DocumentMeta = {
            id: fallbackId,
            title: "New Document",
            icon: "📄",
            isFavorite: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          saveDocumentMeta(fallbackMeta);
          handleSelectDocument(fallbackId);
          return [fallbackMeta];
        }

        if (activeDocId === id) {
          handleSelectDocument(remaining[0].id);
        }
        return remaining;
      });

      setSaveStatus(networkStatus === "offline" ? "offline-cached" : "saved");
    } catch (err) {
      console.error("[SoulDocs] Error deleting document:", err);
      setSaveStatus("error");
    }
  };

  // Content edits trigger debounced metadata update for updatedAt
  const handleContentChange = useCallback(() => {
    setSaveStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const now = Date.now();
        if (activeDocId) {
          await updateDocumentMeta(activeDocId, { updatedAt: now });
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === activeDocId ? { ...doc, updatedAt: now } : doc
            )
          );
        }
        setSaveStatus(networkStatus === "offline" ? "offline-cached" : "saved");
      } catch (err) {
        console.error("[SoulDocs] Error updating content timestamp:", err);
        setSaveStatus("error");
      }
    }, 300);
  }, [activeDocId, networkStatus]);

  const activeDocument =
    documents.find((doc) => doc.id === activeDocId) || documents[0];

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3 text-zinc-400 text-sm">
          <div className="size-3 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-ping" />
          <span className="font-medium">Opening SoulDocs Local Workspace...</span>
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
            initialContent={getInitialSeedContent(activeDocument.id)}
            networkStatus={networkStatus}
            saveStatus={saveStatus}
            onUpdateTitle={handleRenameDocument}
            onUpdateIcon={handleUpdateIcon}
            onToggleFavorite={handleToggleFavorite}
            onContentChange={handleContentChange}
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

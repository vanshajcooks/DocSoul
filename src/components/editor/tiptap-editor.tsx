"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { FormattingToolbar } from "./formatting-toolbar";

// Custom Strike extension mapping both Mod-Shift-x and Mod-Shift-s to toggleStrike
export const CustomStrike = Strike.extend({
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-x": () => this.editor.chain().focus().toggleStrike().run(),
      "Mod-Shift-X": () => this.editor.chain().focus().toggleStrike().run(),
      "Mod-Shift-s": () => this.editor.chain().focus().toggleStrike().run(),
      "Mod-Shift-S": () => this.editor.chain().focus().toggleStrike().run(),
    };
  },
});

interface TipTapEditorProps {
  documentId: string;
  initialContent: string;
  onContentChange: (content: string, wordCount: number) => void;
}

export function TipTapEditor({
  documentId,
  initialContent,
  onContentChange,
}: TipTapEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Disable built-in extensions to use explicit configured instances without duplicates
        strike: false,
        link: false,
        underline: false,
      }),
      CustomStrike,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-blue-600 dark:text-blue-400 underline decoration-blue-400 underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: "Write something extraordinary, or type '/' for commands...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[500px] text-zinc-800 dark:text-zinc-200 prose prose-zinc dark:prose-invert max-w-none leading-relaxed",
      },
      handleKeyDown: (_view, event) => {
        // Prevent Chromium's native writing direction toggle (Ctrl+Shift+X) from altering document alignment
        if (
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          (event.key === "x" || event.key === "X")
        ) {
          event.preventDefault();
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      onContentChange(html, words);
    },
  });

  // Calculate initial word count once editor is ready
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
  }, [editor]);

  // Synchronize content when document switching occurs
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
  }, [documentId, editor, initialContent]);

  if (!mounted) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-zinc-950">
        <div className="h-10 border-b border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30" />
        <div className="flex-1 px-6 py-8 md:px-16 max-w-3xl mx-auto w-full space-y-4">
          <div className="h-6 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-zinc-950">
      <FormattingToolbar editor={editor} />

      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-16 md:py-10">
        <div className="max-w-3xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

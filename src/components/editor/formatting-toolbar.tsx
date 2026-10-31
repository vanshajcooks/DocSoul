"use client";

import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Terminal,
  Minus,
  Undo2,
  Redo2,
  Pilcrow,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
  ExternalLink,
  Check,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FormattingToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  icon,
  label,
  shortcut,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={`p-1.5 rounded-md text-sm transition-all flex items-center justify-center outline-none ${
              isActive
                ? "bg-zinc-200/90 text-zinc-900 font-semibold shadow-2xs dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/80"
            } ${disabled ? "opacity-30 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
          />
        }
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6} className="text-xs py-1 px-2 flex items-center gap-1.5">
        <span>{label}</span>
        {shortcut && (
          <kbd className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded px-1 py-0.5 text-[10px] font-mono border border-zinc-200 dark:border-zinc-700">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 self-center shrink-0" />;
}

export function FormattingToolbar({ editor }: FormattingToolbarProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkOpen, setIsLinkOpen] = useState(false);

  if (!editor) {
    return (
      <div className="h-10 border-b border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center px-4" />
    );
  }

  const isLinkActive = editor.isActive("link");

  const openLinkPopover = () => {
    const existingHref = editor.getAttributes("link").href || "";
    setLinkUrl(existingHref);
    setIsLinkOpen(true);
  };

  const handleApplyLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const formatted =
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("mailto:")
          ? trimmed
          : `https://${trimmed}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: formatted, target: "_blank" })
        .run();
    }
    setIsLinkOpen(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkUrl("");
    setIsLinkOpen(false);
  };

  return (
    <TooltipProvider delay={200}>
      <header className="sticky top-0 z-20 flex items-center gap-0.5 px-3 py-1.5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md overflow-x-auto no-scrollbar transition-colors">
        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={<Undo2 className="size-4" />}
          label="Undo"
          shortcut="Ctrl+Z"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={<Redo2 className="size-4" />}
          label="Redo"
          shortcut="Ctrl+Y"
        />

        <Divider />

        {/* Headings & Text */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive("paragraph") && !editor.isActive("heading")}
          icon={<Pilcrow className="size-4" />}
          label="Paragraph"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          icon={<Heading1 className="size-4" />}
          label="Heading 1"
          shortcut="# "
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          icon={<Heading2 className="size-4" />}
          label="Heading 2"
          shortcut="## "
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          icon={<Heading3 className="size-4" />}
          label="Heading 3"
          shortcut="### "
        />

        <Divider />

        {/* Inline styles */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={<Bold className="size-4" />}
          label="Bold"
          shortcut="Ctrl+B"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={<Italic className="size-4" />}
          label="Italic"
          shortcut="Ctrl+I"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          icon={<UnderlineIcon className="size-4" />}
          label="Underline"
          shortcut="Ctrl+U"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          icon={<Strikethrough className="size-4" />}
          label="Strikethrough"
          shortcut="Ctrl+Shift+X"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          icon={<Code className="size-4" />}
          label="Inline Code"
          shortcut="Ctrl+E"
        />

        {/* Link popover */}
        <Popover open={isLinkOpen} onOpenChange={setIsLinkOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                onClick={openLinkPopover}
                aria-label="Insert Link"
                className={`p-1.5 rounded-md text-sm transition-all flex items-center justify-center outline-none ${
                  isLinkActive
                    ? "bg-zinc-200/90 text-zinc-900 font-semibold shadow-2xs dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer"
                }`}
              />
            }
          >
            <LinkIcon className="size-4" />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 shadow-lg" align="start">
            <form onSubmit={handleApplyLink} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {isLinkActive ? "Edit Link" : "Insert Link"}
                </span>
                {isLinkActive && (
                  <button
                    type="button"
                    onClick={handleRemoveLink}
                    className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Unlink className="size-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <Input
                type="text"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                autoFocus
                className="h-8 text-xs"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsLinkOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="xs" className="gap-1">
                  <Check className="size-3" />
                  <span>Apply</span>
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>

        <Divider />

        {/* Lists & Blocks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={<List className="size-4" />}
          label="Bullet List"
          shortcut="- "
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={<ListOrdered className="size-4" />}
          label="Numbered List"
          shortcut="1. "
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon={<Quote className="size-4" />}
          label="Blockquote"
          shortcut="> "
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          icon={<Terminal className="size-4" />}
          label="Code Block"
          shortcut="```"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={<Minus className="size-4" />}
          label="Horizontal Divider"
          shortcut="---"
        />

        <Divider />

        {/* Clear formatting */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          icon={<RemoveFormatting className="size-4" />}
          label="Clear Formatting"
        />
      </header>
    </TooltipProvider>
  );
}

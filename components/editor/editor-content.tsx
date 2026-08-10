"use client";

import {
  EditorContent as TiptapEditorContent,
} from "@tiptap/react";

import type { EditorContentProps } from "./types";

export default function EditorContent({
  editor,
}: EditorContentProps) {
  if (!editor) {
    return (
      <div className="min-h-[280px] animate-pulse bg-slate-50" />
    );
  }

  return (
    <div className="relative">
      <TiptapEditorContent
        editor={editor}
        className="atlas-rich-text-editor"
      />
    </div>
  );
}
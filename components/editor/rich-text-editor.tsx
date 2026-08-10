"use client";

import { useEffect } from "react";
import { useEditor } from "@tiptap/react";

import { editorExtensions } from "./extensions";
import EditorContent from "./editor-content";
import Toolbar from "./toolbar";
import type {
  RichTextEditorProps,
  RichTextValue,
} from "./types";

import "./styles.css";

const emptyDocument: RichTextValue = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

function normalizeValue(
  value: RichTextValue | undefined
): RichTextValue {
  if (!value) {
    return emptyDocument;
  }

  return value;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Comece a escrever...",
  editable = true,
  className = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,

    extensions: editorExtensions.map((extension) => {
      if (extension.name !== "placeholder") {
        return extension;
      }

      return extension.configure({
        placeholder,
      });
    }),

    content: normalizeValue(value),

    editable,

    editorProps: {
      attributes: {
        class:
          "min-h-[280px] focus:outline-none",
        spellcheck: "true",
      },
    },

    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(editable);
  }, [editable, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextValue = normalizeValue(value);
    const currentValue = editor.getJSON();

    if (
      JSON.stringify(currentValue) ===
      JSON.stringify(nextValue)
    ) {
      return;
    }

    editor.commands.setContent(nextValue, {
      emitUpdate: false,
    });
  }, [editor, value]);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100 ${className}`}
    >
      {editable && <Toolbar editor={editor} />}

      <EditorContent editor={editor} />
    </div>
  );
}
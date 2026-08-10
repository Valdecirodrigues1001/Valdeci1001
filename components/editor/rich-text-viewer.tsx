"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import { editorExtensions } from "./extensions";
import type { RichTextValue } from "./types";

import "./styles.css";

type RichTextViewerProps = {
  value: RichTextValue | string | null;
  className?: string;
};

const emptyDocument: RichTextValue = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

function parseValue(
  value: RichTextValue | string | null
): RichTextValue {
  if (!value) {
    return emptyDocument;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: value,
              },
            ],
          },
        ],
      };
    }
  }

  return value;
}

export default function RichTextViewer({
  value,
  className = "",
}: RichTextViewerProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: editorExtensions,
    content: parseValue(value),
  });

  useEffect(() => {
    if (!editor) return;

    editor.commands.setContent(parseValue(value), {
      emitUpdate: false,
    });
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className={className}>
      <EditorContent
        editor={editor}
        className="atlas-rich-text-editor"
      />
    </div>
  );
}
import type { Editor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";

export type RichTextValue = JSONContent | null;

export type RichTextEditorProps = {
  value?: RichTextValue;
  onChange: (value: JSONContent) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
};

export type ToolbarProps = {
  editor: Editor | null;
};

export type EditorContentProps = {
  editor: Editor | null;
};
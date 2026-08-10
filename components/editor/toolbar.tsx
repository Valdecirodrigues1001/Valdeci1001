"use client";

import type { ReactNode } from "react";
import { useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Video
} from "lucide-react";

import type { ToolbarProps } from "./types";

type ToolbarButtonProps = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({
  label,
  icon,
  active = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "bg-slate-950 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      {icon}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div
      aria-hidden="true"
      className="mx-1 h-6 w-px shrink-0 bg-slate-200"
    />
  );
}

export default function Toolbar({
  editor,
}: ToolbarProps) {
  const editorState = useEditorState({
    editor,

    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return null;
      }

      return {
        isBold: currentEditor.isActive("bold"),
        isItalic: currentEditor.isActive("italic"),
        isUnderline:
          currentEditor.isActive("underline"),
        isStrike: currentEditor.isActive("strike"),

        isHeading2: currentEditor.isActive(
          "heading",
          {
            level: 2,
          }
        ),

        isHeading3: currentEditor.isActive(
          "heading",
          {
            level: 3,
          }
        ),

        isBulletList:
          currentEditor.isActive("bulletList"),

        isOrderedList:
          currentEditor.isActive("orderedList"),

        isBlockquote:
          currentEditor.isActive("blockquote"),

        isAlignLeft: currentEditor.isActive({
          textAlign: "left",
        }),

        isAlignCenter: currentEditor.isActive({
          textAlign: "center",
        }),

        isAlignRight: currentEditor.isActive({
          textAlign: "right",
        }),

        isLink: currentEditor.isActive("link"),

        canUndo: currentEditor.can().undo(),
        canRedo: currentEditor.can().redo(),
      };
    },
  });

  if (!editor || !editorState) {
    return null;
  }

  const currentEditor = editor;

  function handleSetLink() {
    const previousUrl =
      currentEditor.getAttributes("link").href ?? "";

    const url = window.prompt(
      "Digite o endereço do link:",
      previousUrl
    );

    if (url === null) {
      return;
    }

    const normalizedUrl = url.trim();

    if (!normalizedUrl) {
      currentEditor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    currentEditor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: normalizedUrl,
      })
      .run();
  }

  function handleRemoveLink() {
    currentEditor
      .chain()
      .focus()
      .extendMarkRange("link")
      .unsetLink()
      .run();
  }

  function handleAddImage() {
    const url = window.prompt(
      "Cole a URL pública da imagem:"
    );

    if (!url?.trim()) {
      return;
    }

    currentEditor
      .chain()
      .focus()
      .setImage({
        src: url.trim(),
      })
      .run();
  }

  function handleAddYoutube() {
    const url = window.prompt(
      "Cole a URL do vídeo do YouTube:"
    );

    if (!url?.trim()) {
      return;
    }

    currentEditor.commands.setYoutubeVideo({
      src: url.trim(),
      width: 640,
      height: 360,
    });
  }

  return (
    <div className="border-b border-slate-200 bg-white px-3 py-2">
      <div className="flex flex-wrap items-center gap-1">
        <ToolbarButton
          label="Negrito"
          icon={<Bold className="h-4 w-4" />}
          active={editorState.isBold}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
        />

        <ToolbarButton
          label="Itálico"
          icon={<Italic className="h-4 w-4" />}
          active={editorState.isItalic}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
        />

        <ToolbarButton
          label="Sublinhado"
          icon={<Underline className="h-4 w-4" />}
          active={editorState.isUnderline}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleUnderline()
              .run()
          }
        />

        <ToolbarButton
          label="Tachado"
          icon={
            <Strikethrough className="h-4 w-4" />
          }
          active={editorState.isStrike}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Título 2"
          icon={<Heading2 className="h-4 w-4" />}
          active={editorState.isHeading2}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
        />

        <ToolbarButton
          label="Título 3"
          icon={<Heading3 className="h-4 w-4" />}
          active={editorState.isHeading3}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 3,
              })
              .run()
          }
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Lista com marcadores"
          icon={<List className="h-4 w-4" />}
          active={editorState.isBulletList}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        />

        <ToolbarButton
          label="Lista numerada"
          icon={
            <ListOrdered className="h-4 w-4" />
          }
          active={editorState.isOrderedList}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
        />

        <ToolbarButton
          label="Citação"
          icon={<Quote className="h-4 w-4" />}
          active={editorState.isBlockquote}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
        />

        <ToolbarButton
          label="Linha horizontal"
          icon={<Minus className="h-4 w-4" />}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setHorizontalRule()
              .run()
          }
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Alinhar à esquerda"
          icon={
            <AlignLeft className="h-4 w-4" />
          }
          active={editorState.isAlignLeft}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("left")
              .run()
          }
        />

        <ToolbarButton
          label="Centralizar"
          icon={
            <AlignCenter className="h-4 w-4" />
          }
          active={editorState.isAlignCenter}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("center")
              .run()
          }
        />

        <ToolbarButton
          label="Alinhar à direita"
          icon={
            <AlignRight className="h-4 w-4" />
          }
          active={editorState.isAlignRight}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("right")
              .run()
          }
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Inserir ou editar link"
          icon={<Link2 className="h-4 w-4" />}
          active={editorState.isLink}
          onClick={handleSetLink}
        />

        <ToolbarButton
          label="Remover link"
          icon={<Link2Off className="h-4 w-4" />}
          disabled={!editorState.isLink}
          onClick={handleRemoveLink}
        />

        <ToolbarButton
          label="Inserir imagem"
          icon={
            <ImageIcon className="h-4 w-4" />
          }
          onClick={handleAddImage}
        />

        <ToolbarButton
          label="Inserir vídeo do YouTube"
          icon={<Video className="h-4 w-4" />}
          onClick={handleAddYoutube}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Desfazer"
          icon={<Undo2 className="h-4 w-4" />}
          disabled={!editorState.canUndo}
          onClick={() =>
            editor.chain().focus().undo().run()
          }
        />

        <ToolbarButton
          label="Refazer"
          icon={<Redo2 className="h-4 w-4" />}
          disabled={!editorState.canRedo}
          onClick={() =>
            editor.chain().focus().redo().run()
          }
        />
      </div>
    </div>
  );
}
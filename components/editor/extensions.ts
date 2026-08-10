import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

export const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [2, 3],
    },

    /*
     * No TipTap 3, Link e Underline já fazem parte
     * do StarterKit. Desativamos aqui porque vamos
     * configurá-los separadamente abaixo.
     */
    link: false,
    underline: false,
  }),

  Underline,

  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    defaultProtocol: "https",
    protocols: ["http", "https", "mailto", "tel"],
    HTMLAttributes: {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    },
  }),

  Image.configure({
    inline: false,
    allowBase64: false,
    HTMLAttributes: {
      class:
        "mx-auto my-6 h-auto max-w-full rounded-2xl",
    },
  }),

  Youtube.configure({
    controls: true,
    modestBranding: true,
    nocookie: true,
    inline: false,
    width: 640,
    height: 360,
    HTMLAttributes: {
      class:
        "mx-auto my-6 aspect-video max-w-full overflow-hidden rounded-2xl",
    },
  }),

  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right"],
    defaultAlignment: "left",
  }),

  Placeholder.configure({
    placeholder:
      "Comece a escrever sua proposta...",
    emptyEditorClass:
      "is-editor-empty",
  }),
];
"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Type,
  Unlink,
  Plus,
  Minus
} from "lucide-react";
import { useEffect } from "react";

// Custom Font Size Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: { chain: any }) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }: { chain: any }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const btnClass = (active: boolean) => 
    `p-2 rounded-lg transition-colors ${
      active 
        ? "bg-[#219EBC] text-white" 
        : "text-gray-600 hover:bg-gray-100"
    }`;

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'];
  
  const getCurrentFontSize = () => {
    return editor.getAttributes('textStyle').fontSize || '16px';
  };

  const changeFontSize = (direction: 'up' | 'down') => {
    const currentSize = getCurrentFontSize();
    const currentIndex = fontSizes.indexOf(currentSize);
    
    let newIndex;
    if (direction === 'up') {
      newIndex = Math.min(currentIndex + 1, fontSizes.length - 1);
      if (currentIndex === -1) newIndex = 5; // Default to 24px if unknown
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
      if (currentIndex === -1) newIndex = 1; // Default to 14px if unknown
    }
    
    editor.chain().focus().setFontSize(fontSizes[newIndex]).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 mb-4 bg-gray-50 border border-gray-100 rounded-2xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive("underline"))}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Font Size Controls */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1">
        <button
          type="button"
          onClick={() => changeFontSize('down')}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          title="Decrease Size"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-bold w-10 text-center text-[#023047]">
          {getCurrentFontSize()}
        </span>
        <button
          type="button"
          onClick={() => changeFontSize('up')}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          title="Increase Size"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClass(editor.isActive("heading", { level: 1 }))}
        title="H1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive("heading", { level: 2 }))}
        title="H2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={btnClass(editor.isActive("paragraph"))}
        title="Normal Text"
      >
        <Type className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive("bulletList"))}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive("orderedList"))}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button
        type="button"
        onClick={setLink}
        className={btnClass(editor.isActive("link"))}
        title="Add Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      {editor.isActive("link") && (
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className={btnClass(false)}
          title="Remove Link"
        >
          <Unlink className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#219EBC] underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Write something inspiring...",
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[300px] max-w-none",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full bg-gray-50 border-0 rounded-[32px] p-6 focus-within:ring-2 focus-within:ring-[#219EBC] transition-all">
      <MenuBar editor={editor} />
      <div className="px-2 pb-2">
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .tiptap {
          outline: none !important;
        }
        .tiptap p {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}


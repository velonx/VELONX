"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
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
  Minus,
  Table as TableIcon,
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Trash2,
  Trash,
  SplitSquareHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Palette,
  CheckSquare,
  Quote,
  Code,
  MinusSquare,
  Undo2,
  Redo2,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  RemoveFormatting,
  Image as ImageIcon
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

  const addImage = () => {
    const url = window.prompt('URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const btnClass = (active: boolean) => 
    `p-2 rounded-lg transition-colors flex items-center justify-center ${
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
    <div className="flex flex-col gap-2 p-3 mb-4 bg-gray-50/95 backdrop-blur-xl border border-gray-100 rounded-2xl sticky top-4 z-40 shadow-sm">
      {/* Primary Toolbar Row */}
      <div className="flex flex-wrap items-center gap-1">
        {/* History & Utility */}
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btnClass(false)} title="Undo"><Undo2 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btnClass(false)} title="Redo"><Redo2 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} className={btnClass(false)} title="Clear Formatting"><RemoveFormatting className="w-4 h-4" /></button>
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Text Styles */}
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive("heading", { level: 1 }))} title="H1"><Heading1 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))} title="H2"><Heading2 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={btnClass(editor.isActive("paragraph"))} title="Normal Text"><Type className="w-4 h-4" /></button>
        
        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))} title="Bold"><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))} title="Italic"><Italic className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive("underline"))} title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
        
        {/* Font Size Controls */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1 mx-1">
          <button type="button" onClick={() => changeFontSize('down')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Decrease Size"><Minus className="w-3.5 h-3.5" /></button>
          <span className="text-[10px] font-bold w-10 text-center text-[#023047]">{getCurrentFontSize()}</span>
          <button type="button" onClick={() => changeFontSize('up')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="Increase Size"><Plus className="w-3.5 h-3.5" /></button>
        </div>

        {/* Colors & Highlights */}
        <input type="color" onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()} value={editor.getAttributes('textStyle').color || '#000000'} className="w-8 h-8 rounded cursor-pointer border-0 p-0 ml-1" title="Text Color" />
        <button type="button" onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffcc00' }).run()} className={btnClass(editor.isActive("highlight"))} title="Highlight Text"><Highlighter className="w-4 h-4" /></button>

      </div>

      {/* Secondary Toolbar Row */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Alignment */}
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Align Left"><AlignLeft className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Align Center"><AlignCenter className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Align Right"><AlignRight className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={btnClass(editor.isActive({ textAlign: 'justify' }))} title="Justify"><AlignJustify className="w-4 h-4" /></button>
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Lists & Blocks */}
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))} title="Bullet List"><List className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))} title="Ordered List"><ListOrdered className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleTaskList().run()} className={btnClass(editor.isActive("taskList"))} title="Task List"><CheckSquare className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))} title="Blockquote"><Quote className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive("codeBlock"))} title="Code Block"><Code className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)} title="Horizontal Rule"><MinusSquare className="w-4 h-4" /></button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Links & Media */}
        <button type="button" onClick={setLink} className={btnClass(editor.isActive("link"))} title="Add Link"><LinkIcon className="w-4 h-4" /></button>
        {editor.isActive("link") && (
          <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} className={btnClass(false)} title="Remove Link"><Unlink className="w-4 h-4" /></button>
        )}
        <button type="button" onClick={addImage} className={btnClass(false)} title="Add Image URL"><ImageIcon className="w-4 h-4" /></button>
        
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Sub/Superscript */}
        <button type="button" onClick={() => editor.chain().focus().toggleSubscript().run()} className={btnClass(editor.isActive("subscript"))} title="Subscript"><SubscriptIcon className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleSuperscript().run()} className={btnClass(editor.isActive("superscript"))} title="Superscript"><SuperscriptIcon className="w-4 h-4" /></button>
      </div>

      {/* Table Actions Row (Only visible when a table is active or inserting one) */}
      <div className="flex flex-wrap items-center gap-1 bg-white p-2 rounded-xl border border-gray-100 mt-1">
        <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={btnClass(false)} title="Insert Table"><TableIcon className="w-4 h-4 mr-2" /> Insert Table</button>
        {editor.isActive('table') && (
          <>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className={btnClass(false)} title="Add Column Before"><BetweenHorizontalStart className="w-4 h-4" /></button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className={btnClass(false)} title="Add Column After"><BetweenHorizontalEnd className="w-4 h-4" /></button>
            <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className={btnClass(false)} title="Delete Column"><Trash2 className="w-4 h-4 text-red-500" /></button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className={btnClass(false)} title="Add Row Before"><BetweenVerticalStart className="w-4 h-4" /></button>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className={btnClass(false)} title="Add Row After"><BetweenVerticalEnd className="w-4 h-4" /></button>
            <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className={btnClass(false)} title="Delete Row"><Trash2 className="w-4 h-4 text-red-500" /></button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().mergeCells().run()} className={btnClass(false)} title="Merge Cells"><SplitSquareHorizontal className="w-4 h-4" /></button>
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className={`${btnClass(false)} text-red-500 hover:bg-red-50 hover:text-red-600`} title="Delete Table"><Trash className="w-4 h-4 mr-2" /> Delete Table</button>
          </>
        )}
      </div>
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
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Subscript,
      Superscript,
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
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[300px] max-w-none px-4 py-2 border rounded-xl border-transparent focus-within:border-[#219EBC]/30",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full bg-white border border-gray-100 shadow-sm rounded-[32px] p-6 focus-within:ring-2 focus-within:ring-[#219EBC] transition-all">
      <MenuBar editor={editor} />
      <div className="px-2 pb-2">
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{\`
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
        /* Table Styles */
        .tiptap table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        .tiptap table td,
        .tiptap table th {
          min-width: 1em;
          border: 2px solid #ced4da;
          padding: 8px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .tiptap table th {
          font-weight: bold;
          text-align: left;
          background-color: #f1f3f5;
        }
        .tiptap table .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #adf;
          pointer-events: none;
        }
        /* Task List Styles */
        .tiptap ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .tiptap ul[data-type="taskList"] li {
          display: flex;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .tiptap ul[data-type="taskList"] li > label {
          margin-right: 0.5rem;
          user-select: none;
        }
        .tiptap ul[data-type="taskList"] li > div {
          flex: 1;
        }
        /* Image Styles */
        .tiptap img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
      \`}</style>
    </div>
  );
}

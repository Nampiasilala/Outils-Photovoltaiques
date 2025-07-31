'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { useEffect } from 'react';

export default function TiptapEditor({
  content,
  onChange,
  editable,
}: {
  content: string;
  onChange: (html: string) => void;
  editable: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
      }),
      Heading.configure({ levels: [1, 2] }),
      BulletList,
      OrderedList,
      Underline,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose max-w-none min-h-[200px] p-4 bg-white border border-gray-300 rounded focus:outline-none text-gray-800',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  const Button = ({
    command,
    label,
    isActive,
  }: {
    command: () => void;
    label: string;
    isActive?: boolean;
  }) => (
    <button
      onClick={command}
      type="button"
      className={`px-2 py-1 text-sm rounded border ${
        isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
      } hover:bg-blue-50 border-gray-300`}
    >
      {label}
    </button>
  );

  const Toolbar = ({ editor }: { editor: Editor }) => {
    if (!editor) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          label="Gras"
          isActive={editor.isActive('bold')}
          command={() => editor.chain().focus().toggleBold().run()}
        />
        <Button
          label="Italique"
          isActive={editor.isActive('italic')}
          command={() => editor.chain().focus().toggleItalic().run()}
        />
        <Button
          label="Souligné"
          isActive={editor.isActive('underline')}
          command={() => editor.chain().focus().toggleUnderline().run()}
        />
        <Button
          label="Titre 1"
          isActive={editor.isActive('heading', { level: 1 })}
          command={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <Button
          label="Titre 2"
          isActive={editor.isActive('heading', { level: 2 })}
          command={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <Button
          label="Paragraphe"
          isActive={editor.isActive('paragraph')}
          command={() => editor.chain().focus().setParagraph().run()}
        />
        <Button
          label="Liste •"
          isActive={editor.isActive('bulletList')}
          command={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Button
          label="Liste 1."
          isActive={editor.isActive('orderedList')}
          command={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <Button
          label="Effacer"
          command={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        />
      </div>
    );
  };

  return (
    <div>
      {editor && editable && <Toolbar editor={editor} />}
      {editor && <EditorContent editor={editor} />}
    </div>
  );
}

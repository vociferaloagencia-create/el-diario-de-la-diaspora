
"use client";

import React, { useCallback } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Image as ImageIcon, Heading1, Heading2, Heading3 } from 'lucide-react';
import { useEditor, EditorContent, Editor as TipTapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import ImageExtension from '@tiptap/extension-image';
import { Toggle } from './toggle';
import { Button } from './button';
import { uploadImage } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

const Toolbar = ({ editor }: { editor: TipTapEditor | null }) => {
  const { toast } = useToast();

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return;
    const file = event.target.files?.[0];
    if (file) {
      toast({ title: 'Subiendo imagen...', description: 'Por favor, espera.' });
      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
        toast({ title: 'Imagen insertada' });
      } catch (error) {
        console.error('Error al subir imagen:', error);
        toast({ title: 'Error', description: 'No se pudo subir la imagen.', variant: 'destructive' });
      }
    }
  }, [editor, toast]);

  const toggleBold = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleBold().run();
  }, [editor]);
  const toggleItalic = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleItalic().run();
  }, [editor]);
  const toggleUnderline = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleUnderline().run();
  }, [editor]);
  const toggleH1 = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleHeading({ level: 1 }).run();
  }, [editor]);
  const toggleH2 = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleHeading({ level: 2 }).run();
  }, [editor]);
  const toggleH3 = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleHeading({ level: 3 }).run();
  }, [editor]);
  const toggleBulletList = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleBulletList().run();
  }, [editor]);
  const toggleOrderedList = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleOrderedList().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input bg-transparent rounded-t-md p-2 flex items-center gap-1 flex-wrap">
      <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={toggleBold}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={toggleItalic}>
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={toggleUnderline}>
        <Underline className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 1 })} onPressedChange={toggleH1}>
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={toggleH2}>
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 3 })} onPressedChange={toggleH3}>
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={toggleBulletList}>
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={toggleOrderedList}>
        <ListOrdered className="h-4 w-4" />
      </Toggle>
       <Button size="sm" variant="outline" asChild className="relative cursor-pointer">
        <div>
          <ImageIcon className="h-4 w-4" />
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
        </div>
      </Button>
    </div>
  );
};

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor = ({ value, onChange }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        strike: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      UnderlineExtension,
      ImageExtension.configure({
        inline: false,
        HTMLAttributes: {
          class: 'my-4 rounded-lg shadow-md',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert min-h-[400px] w-full max-w-none rounded-md rounded-t-none border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="flex flex-col justify-stretch">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

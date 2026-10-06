"use client";

import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  useEditor,
  EditorContent,
  Editor as TipTapEditor,
  ReactNodeViewRenderer,
  NodeViewWrapper,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import ImageExtension from '@tiptap/extension-image';
import { Toggle } from './toggle';
import { Button } from './button';
import { uploadImage } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

// Componente interactivo para cada imagen con handles de arrastre y botones de borrado/alineación
const ResizableImageComponent = ({ node, updateAttributes, deleteNode, selected }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { src, alt, width = '100%', alignment = 'center' } = node.attrs;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const parent = containerRef.current?.parentElement;
    const parentWidth = parent ? parent.clientWidth : 800;
    const initialWidthPx = containerRef.current ? containerRef.current.clientWidth : parentWidth;

    const onPointerMove = (ev: PointerEvent) => {
      const deltaX = ev.clientX - startX;
      const newWidthPx = Math.max(120, Math.min(parentWidth, initialWidthPx + deltaX));
      const percentage = Math.round((newWidthPx / parentWidth) * 100);
      updateAttributes({ width: `${percentage}%` });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const alignClass =
    alignment === 'left'
      ? 'justify-start mr-auto'
      : alignment === 'right'
      ? 'justify-end ml-auto'
      : 'justify-center mx-auto';

  return (
    <NodeViewWrapper className={`my-4 flex ${alignClass} w-full select-none`}>
      <div
        ref={containerRef}
        style={{ width: width || '100%', maxWidth: '100%' }}
        className={`group relative rounded-xl transition-all border-2 ${
          selected
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <img
          src={src}
          alt={alt || ''}
          className="w-full h-auto rounded-lg shadow-sm object-contain block pointer-events-none"
        />

        {/* Barra flotante sobre la foto con alineación y papelera */}
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/95 text-white px-2 py-1 rounded-lg shadow-xl z-30 text-xs backdrop-blur-sm pointer-events-auto">
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: 'left' })}
            className={`p-1 rounded hover:bg-white/20 ${alignment === 'left' ? 'text-primary' : ''}`}
            title="Alinear a la izquierda"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: 'center' })}
            className={`p-1 rounded hover:bg-white/20 ${alignment === 'center' ? 'text-primary' : ''}`}
            title="Centrar imagen"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: 'right' })}
            className={`p-1 rounded hover:bg-white/20 ${alignment === 'right' ? 'text-primary' : ''}`}
            title="Alinear a la derecha"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-white/30 mx-1" />
          <button
            type="button"
            onClick={deleteNode}
            className="p-1 rounded text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-1 font-semibold"
            title="Eliminar imagen"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[10px]">Borrar</span>
          </button>
        </div>

        {/* Manija táctil / ratón en la esquina para arrastrar y redimensionar */}
        <div
          onPointerDown={handlePointerDown}
          className="absolute -bottom-2.5 -right-2.5 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center cursor-nwse-resize shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-all z-30 hover:scale-125"
          title="Arrastra para agrandar o reducir el tamaño"
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      </div>
    </NodeViewWrapper>
  );
};

// Extensión de imagen con atributos de tamaño y alineación persistentes
const ResizableImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attributes) => ({
          style: `width: ${attributes.width || '100%'}; max-width: 100%; height: auto; display: block; margin: ${
            attributes.alignment === 'left'
              ? '1rem auto 1rem 0'
              : attributes.alignment === 'right'
              ? '1rem 0 1rem auto'
              : '1rem auto'
          };`,
          'data-width': attributes.width,
          'data-alignment': attributes.alignment || 'center',
        }),
        parseHTML: (element) => element.style.width || element.getAttribute('data-width') || '100%',
      },
      alignment: {
        default: 'center',
        renderHTML: (attributes) => ({
          'data-alignment': attributes.alignment || 'center',
        }),
        parseHTML: (element) => element.getAttribute('data-alignment') || 'center',
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

interface ToolbarProps {
  editor: TipTapEditor | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const Toolbar = ({ editor, isFullscreen, onToggleFullscreen }: ToolbarProps) => {
  const { toast } = useToast();

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!editor) return;
      const file = event.target.files?.[0];
      if (file) {
        toast({ title: 'Subiendo imagen...', description: 'Por favor, espera.' });
        try {
          const url = await uploadImage(file);
          editor.chain().focus().setImage({ src: url }).run();
          toast({ title: 'Imagen insertada', description: 'Arrastra la esquina de la foto para cambiar su tamaño.' });
        } catch (error) {
          console.error('Error al subir imagen:', error);
          toast({ title: 'Error', description: 'No se pudo subir la imagen.', variant: 'destructive' });
        }
      }
    },
    [editor, toast]
  );

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
    <div className="border border-input bg-card/60 backdrop-blur-sm rounded-t-md p-2 flex items-center justify-between gap-1 flex-wrap">
      <div className="flex items-center gap-1 flex-wrap">
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
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageUpload}
            />
          </div>
        </Button>
      </div>

      {/* Botón Pantalla Completa */}
      <Button
        type="button"
        size="sm"
        variant={isFullscreen ? 'default' : 'ghost'}
        onClick={onToggleFullscreen}
        className="gap-1.5 text-xs h-8 px-2.5"
        title={isFullscreen ? 'Salir de pantalla completa (Esc)' : 'Expandir a pantalla completa'}
      >
        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}</span>
      </Button>
    </div>
  );
};

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor = ({ value, onChange }: EditorProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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
      ResizableImage,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert min-h-[400px] w-full max-w-none rounded-md rounded-t-none border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-hidden'
          : 'flex flex-col justify-stretch'
      }
    >
      <Toolbar
        editor={editor}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
      />
      <div className={isFullscreen ? 'flex-1 overflow-y-auto max-w-4xl mx-auto w-full pt-4' : ''}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

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
  Move,
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

// Componente interactivo para cada imagen con 4 puntos de arrastre con ratón, drag & drop y envoltura de texto
const ResizableImageComponent = ({ node, updateAttributes, deleteNode, selected }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { src, alt, width = '100%', alignment = 'center' } = node.attrs;

  const handlePointerDown = (corner: 'tl' | 'tr' | 'bl' | 'br') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const parent = containerRef.current?.parentElement;
    const parentWidth = parent ? parent.clientWidth : 800;
    const initialWidthPx = containerRef.current ? containerRef.current.clientWidth : parentWidth;

    const onPointerMove = (ev: PointerEvent) => {
      const rawDeltaX = ev.clientX - startX;
      const deltaX = (corner === 'tr' || corner === 'br') ? rawDeltaX : -rawDeltaX;
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

  const isLeft = alignment === 'left';
  const isRight = alignment === 'right';

  const wrapperStyle: React.CSSProperties = {
    float: isLeft ? 'left' : isRight ? 'right' : 'none',
    margin: isLeft
      ? '0.5rem 1.25rem 0.75rem 0'
      : isRight
      ? '0.5rem 0 0.75rem 1.25rem'
      : '1.25rem auto',
    clear: isLeft || isRight ? 'none' : 'both',
    display: isLeft || isRight ? 'inline-block' : 'flex',
    justifyContent: isLeft ? 'flex-start' : isRight ? 'flex-end' : 'center',
    width: isLeft || isRight ? (width === '100%' ? '50%' : width) : (width || '100%'),
    maxWidth: '100%',
  };

  return (
    <NodeViewWrapper
      className="relative select-none my-2 transition-all"
      style={wrapperStyle}
    >
      <div
        ref={containerRef}
        style={{ width: '100%' }}
        className={`group relative rounded-xl transition-all border-2 ${
          selected
            ? 'border-primary ring-2 ring-primary/20 shadow-md'
            : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        {/* Imagen principal con arrastre directo del ratón */}
        <img
          src={src}
          alt={alt || ''}
          data-drag-handle
          className="w-full h-auto rounded-lg shadow-sm object-contain block cursor-grab active:cursor-grabbing"
          title="Haz clic y arrastra con el ratón para moverla en el texto"
        />

        {/* Barra flotante superior integrada dentro de la foto */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/95 text-white px-2 py-1 rounded-lg shadow-xl z-30 text-xs backdrop-blur-sm pointer-events-auto">
          {/* Manija con el mouse para reubicar la imagen */}
          <div
            data-drag-handle
            className="p-1 rounded cursor-grab active:cursor-grabbing hover:bg-white/20 text-white flex items-center gap-1 font-medium select-none"
            title="Arrastra con el ratón para reubicar en el texto"
          >
            <Move className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] hidden sm:inline">Arrastrar</span>
          </div>

          <div className="h-3 w-px bg-white/30 mx-0.5" />

          {/* Opciones de alineación / texto envolvente */}
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: 'left', width: width === '100%' ? '50%' : width })}
            className={`p-1 rounded hover:bg-white/20 ${alignment === 'left' ? 'text-primary font-bold' : ''}`}
            title="Flotar a la izquierda (texto rodea a la derecha)"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: 'center' })}
            className={`p-1 rounded hover:bg-white/20 ${alignment === 'center' ? 'text-primary font-bold' : ''}`}
            title="Centrado en bloque"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ alignment: 'right', width: width === '100%' ? '50%' : width })}
            className={`p-1 rounded hover:bg-white/20 ${alignment === 'right' ? 'text-primary font-bold' : ''}`}
            title="Flotar a la derecha (texto rodea a la izquierda)"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-px bg-white/30 mx-0.5" />

          {/* Eliminar foto */}
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

        {/* 4 Manijas interactivas en las 4 esquinas para arrastrar con el ratón */}
        <div
          onPointerDown={handlePointerDown('tl')}
          className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center cursor-nwse-resize shadow-md border-2 border-white opacity-0 group-hover:opacity-100 transition-all z-30 hover:scale-125"
          title="Arrastra con el ratón para cambiar tamaño"
        />
        <div
          onPointerDown={handlePointerDown('tr')}
          className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center cursor-nesw-resize shadow-md border-2 border-white opacity-0 group-hover:opacity-100 transition-all z-30 hover:scale-125"
          title="Arrastra con el ratón para cambiar tamaño"
        />
        <div
          onPointerDown={handlePointerDown('bl')}
          className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center cursor-nesw-resize shadow-md border-2 border-white opacity-0 group-hover:opacity-100 transition-all z-30 hover:scale-125"
          title="Arrastra con el ratón para cambiar tamaño"
        />
        <div
          onPointerDown={handlePointerDown('br')}
          className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center cursor-nwse-resize shadow-md border-2 border-white opacity-0 group-hover:opacity-100 transition-all z-30 hover:scale-125"
          title="Arrastra con el ratón para cambiar tamaño"
        />
      </div>
    </NodeViewWrapper>
  );
};

// Extensión de imagen con atributos de tamaño, alineación y arrastre nativo
const ResizableImage = ImageExtension.extend({
  draggable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attributes) => ({
          style: `width: ${attributes.width || '100%'}; max-width: 100%; height: auto; ${
            attributes.alignment === 'left'
              ? 'float: left; margin: 0.5rem 1.25rem 0.75rem 0;'
              : attributes.alignment === 'right'
              ? 'float: right; margin: 0.5rem 0 0.75rem 1.25rem;'
              : 'display: block; margin: 1.25rem auto; clear: both;'
          }`,
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

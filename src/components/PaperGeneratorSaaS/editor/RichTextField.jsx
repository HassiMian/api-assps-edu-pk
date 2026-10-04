import { useEditor, EditorContent } from '@tiptap/react'
import { createPaperEditorExtensions } from './editorExtensions'

export default function RichTextField({
  value = '',
  onChange,
  placeholder,
  direction = 'ltr',
  minHeight = 72,
  className = '',
}) {
  const editor = useEditor({
    extensions: createPaperEditorExtensions(placeholder),
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class: `pg-rich-field ${className}`.trim(),
        style: `min-height:${minHeight}px;outline:none;line-height:1.6;direction:${direction};text-align:${direction === 'rtl' ? 'right' : 'left'}`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getHTML())
    },
  })

  return (
    <div
      className="pg-rich-text-wrap"
      data-direction={direction}
      style={{
        border: '1px solid rgba(148,163,184,0.22)',
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.98)',
        color: '#1a1a1a',
      }}
    >
      <EditorContent editor={editor} />
    </div>
  )
}

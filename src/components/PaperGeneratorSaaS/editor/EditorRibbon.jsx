const D = {
  gold: '#C8991A',
  silver: '#C0C8D8',
  muted: '#8892A4',
  border: 'rgba(148,163,184,0.18)',
}

function ToolBtn({ active, onClick, children, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        minWidth: 44,
        minHeight: 44,
        padding: '0 10px',
        borderRadius: 10,
        border: `1px solid ${active ? 'rgba(200,153,26,0.55)' : D.border}`,
        background: active ? 'rgba(200,153,26,0.16)' : 'rgba(11,44,77,0.55)',
        color: active ? D.gold : D.silver,
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

function insertImageFromFile(editor) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result }).run()
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

export default function EditorRibbon({ editor, compact = false }) {
  if (!editor) return null

  const run = (fn) => () => fn()

  const tools = [
    { title: 'Bold', label: 'B', active: editor.isActive('bold'), onClick: () => editor.chain().focus().toggleBold().run() },
    { title: 'Italic', label: 'I', active: editor.isActive('italic'), onClick: () => editor.chain().focus().toggleItalic().run() },
    { title: 'Underline', label: 'U', active: editor.isActive('underline'), onClick: () => editor.chain().focus().toggleUnderline().run() },
    { title: 'Bullet list', label: '•', active: editor.isActive('bulletList'), onClick: () => editor.chain().focus().toggleBulletList().run() },
    { title: 'Numbered list', label: '1.', active: editor.isActive('orderedList'), onClick: () => editor.chain().focus().toggleOrderedList().run() },
    { title: 'Align left', label: '⫷', active: editor.isActive({ textAlign: 'left' }), onClick: () => editor.chain().focus().setTextAlign('left').run() },
    { title: 'Align center', label: '≡', active: editor.isActive({ textAlign: 'center' }), onClick: () => editor.chain().focus().setTextAlign('center').run() },
    { title: 'Align right', label: '⫸', active: editor.isActive({ textAlign: 'right' }), onClick: () => editor.chain().focus().setTextAlign('right').run() },
    { title: 'Insert table', label: '⊞', active: editor.isActive('table'), onClick: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    { title: 'Add row', label: '+R', active: false, onClick: () => editor.chain().focus().addRowAfter().run() },
    { title: 'Add column', label: '+C', active: false, onClick: () => editor.chain().focus().addColumnAfter().run() },
    { title: 'Insert image', label: '🖼', active: false, onClick: () => insertImageFromFile(editor) },
    { title: 'Undo', label: '↶', active: false, onClick: () => editor.chain().focus().undo().run() },
    { title: 'Redo', label: '↷', active: false, onClick: () => editor.chain().focus().redo().run() },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: compact ? 6 : 8,
        padding: compact ? '8px 10px' : '10px 12px',
        borderRadius: 12,
        border: `1px solid ${D.border}`,
        background: 'rgba(7,22,40,0.92)',
        position: compact ? 'sticky' : 'relative',
        bottom: compact ? 0 : undefined,
        zIndex: 5,
      }}
      role="toolbar"
      aria-label="Formatting"
    >
      {tools.map(tool => (
        <ToolBtn key={tool.title} title={tool.title} active={tool.active} onClick={run(tool.onClick)}>
          {tool.label}
        </ToolBtn>
      ))}
    </div>
  )
}

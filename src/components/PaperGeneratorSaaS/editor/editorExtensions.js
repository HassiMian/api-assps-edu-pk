import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

export function createPaperEditorExtensions(placeholder = 'Type here…') {
  return [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder }),
    Image.configure({ inline: false, allowBase64: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ]
}

export const editorProseStyles = `
.pg-rich-text-wrap .ProseMirror,.pg-block-body.ProseMirror{outline:none;min-height:64px}
.pg-rich-text-wrap .ProseMirror p,.pg-block-body.ProseMirror p{margin:0 0 8px}
.pg-rich-text-wrap .ProseMirror ul,.pg-block-body.ProseMirror ul,.pg-rich-text-wrap .ProseMirror ol,.pg-block-body.ProseMirror ol{margin:4px 0 8px 20px;padding:0}
.pg-rich-text-wrap .ProseMirror table,.pg-block-body.ProseMirror table{border-collapse:collapse;width:100%;margin:8px 0}
.pg-rich-text-wrap .ProseMirror th,.pg-block-body.ProseMirror th,.pg-rich-text-wrap .ProseMirror td,.pg-block-body.ProseMirror td{border:1px solid #cbd5e1;padding:6px 8px;font-size:12px;vertical-align:top}
.pg-rich-text-wrap .ProseMirror th,.pg-block-body.ProseMirror th{background:#f1f5f9;font-weight:700}
.pg-rich-text-wrap .ProseMirror img,.pg-block-body.ProseMirror img{max-width:100%;height:auto;border-radius:6px;margin:8px 0}
.pg-rich-text-wrap .ProseMirror .selectedCell,.pg-block-body.ProseMirror .selectedCell{background:rgba(200,153,26,0.12)}
`

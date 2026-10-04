import { getTemplatePreviewPath } from './templatePreviewAssets'

export const CLASSIC_TEMPLATES = [
  { id: 'classic', label: 'AS Classic', desc: 'Official school table layout with logo', category: 'classic', preview: getTemplatePreviewPath('classic'), thumb: { paper: '#fff', header: '#fff', accent: '#1a237e', logo: 'table' } },
  { id: 'oxford', label: 'Oxford Formal', desc: 'Navy header band, logo left, cream paper', category: 'classic', preview: getTemplatePreviewPath('oxford'), thumb: { paper: '#FAF8F5', header: '#1B2A4A', accent: '#C4A35A', logo: 'left' } },
  { id: 'cambridge', label: 'Cambridge Slate', desc: 'Centered logo, charcoal and copper accents', category: 'classic', preview: getTemplatePreviewPath('cambridge'), thumb: { paper: '#FDFCFB', header: '#FDFCFB', accent: '#B87E5B', logo: 'center' } },
  { id: 'institutional', label: 'Institutional Pro', desc: 'Logo right, teal accent institutional sheet', category: 'classic', preview: getTemplatePreviewPath('institutional'), thumb: { paper: '#fff', header: '#F4F7F8', accent: '#0E5C75', logo: 'right', bar: true } },
  { id: 'board', label: 'Board Standard', desc: 'Maroon formal board examination style', category: 'classic', preview: getTemplatePreviewPath('board'), thumb: { paper: '#fff', header: '#fff', accent: '#7A2038', logo: 'table' } },
  { id: 'docx-assessment', label: 'DOCX Assessment', desc: 'Minimal Word-style assessment format', category: 'classic', preview: getTemplatePreviewPath('docx-assessment'), thumb: { paper: '#fff', header: '#fff', accent: '#111', logo: 'none' } },
]

export const ALL_TEMPLATE_PICKER = (premiumPicker = []) => [...CLASSIC_TEMPLATES, ...premiumPicker]

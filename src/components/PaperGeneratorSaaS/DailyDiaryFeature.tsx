'use client';

import React, { useEffect, useMemo, useState } from 'react';
import api from '@/utils/api';
import { useAcademicStore } from '../../services/useAcademicStore';
import { usePaperStore } from './usePaperStore';

type SubjectRow = {
  id: string;
  subject: string;
  diary: string;
  isUrdu?: boolean;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  textColor?: string;
  subjectBold?: boolean;
};

type Template = {
  id: number;
  name: string;
  hero: string;
  head: string;
  even: string;
  footer: string;
  motif?: string;
  accent?: string;
  headerStyle?: 'classic' | 'ribbon' | 'split' | 'badge';
};

type StyleSettings = {
  radius: number;
  headerFontSize: number;
  bodyFontSize: number;
  fontFamily: string;
  bodyLineHeight: number;
  bodyWordSpacing: number;
  headerLetterSpacing: number;
  showWatermark: boolean;
};

type DiaryRecord = {
  id?: number;
  template_id?: number;
  templateId?: number;
  school_name?: string;
  tagline?: string;
  logo_url?: string;
  class_level?: string;
  class_name?: string;
  diary_date?: string;
  slips_per_page?: number;
  footer_text?: string;
  footer_is_urdu?: boolean;
  rows?: SubjectRow[];
  style_settings?: Partial<StyleSettings>;
};

const templates: Template[] = [
  { id: 1, name: 'Canva Ivory Ledger', hero: 'linear-gradient(135deg,#26324a,#7b8ba8)', head: '#26324a', even: '#f5f7fb', footer: '#edf1f7' },
  { id: 2, name: 'Pearl Gold Academy', hero: 'linear-gradient(135deg,#2c2a24,#b69b5e)', head: '#2c2a24', even: '#fbf7ed', footer: '#f3ead3' },
  { id: 3, name: 'Sage Montessori Luxe', hero: 'linear-gradient(135deg,#23443b,#77a896)', head: '#23443b', even: '#f0f7f4', footer: '#dfeee8' },
  { id: 4, name: 'Ink Lilac Editorial', hero: 'linear-gradient(135deg,#2f3146,#8d86b8)', head: '#34304f', even: '#f5f3fa', footer: '#e8e4f2' },
  { id: 5, name: 'Warm Sand Junior', hero: 'linear-gradient(135deg,#514131,#c79b74)', head: '#514131', even: '#fbf4ec', footer: '#f0dfcf' },
  { id: 6, name: 'Oxford Slate Minimal', hero: 'linear-gradient(135deg,#1f2937,#64748b)', head: '#1f2937', even: '#f8fafc', footer: '#e7edf4' },
  { id: 7, name: 'Blush Rose Premium', hero: 'linear-gradient(135deg,#633143,#bd7892)', head: '#633143', even: '#fbf1f5', footer: '#f2dbe5' },
  { id: 8, name: 'Coastal Teal Glass', hero: 'linear-gradient(135deg,#244b5a,#78b9c7)', head: '#244b5a', even: '#eef8fa', footer: '#d8edf2' },
  { id: 9, name: 'Olive Linen Classic', hero: 'linear-gradient(135deg,#3e4a2f,#9caf78)', head: '#3e4a2f', even: '#f6f8ee', footer: '#e6ecd5' },
  { id: 10, name: 'Stone Platinum', hero: 'linear-gradient(135deg,#3b3834,#aaa39b)', head: '#3b3834', even: '#f7f6f4', footer: '#e6e2dd' },
  { id: 11, name: 'Junior Sky Explorer', hero: 'linear-gradient(135deg,#185a9d,#43cea2)', head: '#185a9d', even: '#ecf8ff', footer: '#d9f4ef', motif: 'ABC', accent: '#43cea2', headerStyle: 'ribbon' },
  { id: 12, name: 'Kinder Rainbow Studio', hero: 'linear-gradient(135deg,#5b2c83,#f07c41)', head: '#5b2c83', even: '#fff1e9', footer: '#f8e4ff', motif: '123', accent: '#f7c948', headerStyle: 'split' },
  { id: 13, name: 'Tiny Scholars Crest', hero: 'linear-gradient(135deg,#17324d,#d6a23f)', head: '#17324d', even: '#f5f9ff', footer: '#fff4d9', motif: 'A+', accent: '#d6a23f', headerStyle: 'badge' },
  { id: 14, name: 'Playroom Garden Luxe', hero: 'linear-gradient(135deg,#246b47,#c3d84a)', head: '#246b47', even: '#f1fae7', footer: '#e4f4d1', motif: 'ART', accent: '#f4a340', headerStyle: 'ribbon' },
  { id: 15, name: 'Little Genius Blocks', hero: 'linear-gradient(135deg,#264653,#e76f51)', head: '#264653', even: '#f5fbfc', footer: '#ffe7df', motif: 'IQ', accent: '#2a9d8f', headerStyle: 'split' },
  { id: 16, name: 'Nursery Storybook', hero: 'linear-gradient(135deg,#7b3f61,#efb0a1)', head: '#7b3f61', even: '#fff3f7', footer: '#fde4dc', motif: 'READ', accent: '#ffd166', headerStyle: 'badge' },
  { id: 17, name: 'Prep Class Sunshine', hero: 'linear-gradient(135deg,#004e64,#f9c74f)', head: '#004e64', even: '#eefbff', footer: '#fff2c7', motif: 'PREP', accent: '#00a6a6', headerStyle: 'ribbon' },
  { id: 18, name: 'Mini Makers Lab', hero: 'linear-gradient(135deg,#2f2d52,#5ad2f4)', head: '#2f2d52', even: '#eef7ff', footer: '#def7ff', motif: 'LAB', accent: '#ffcf56', headerStyle: 'split' },
  { id: 19, name: 'Primary Pastel Crown', hero: 'linear-gradient(135deg,#31572c,#90a955)', head: '#31572c', even: '#f8fbef', footer: '#e9f3d2', motif: 'KIDS', accent: '#ecb365', headerStyle: 'badge' },
  { id: 20, name: 'Bright Minds Academy', hero: 'linear-gradient(135deg,#0f4c81,#e85d75)', head: '#0f4c81', even: '#f0f7ff', footer: '#ffe4ea', motif: 'STAR', accent: '#f7b801', headerStyle: 'ribbon' },
];

const FALLBACK_CLASSES = [
  { level: 'play', label: 'PLAY' },
  { level: 'nursery', label: 'NURSERY' },
  { level: 'prep', label: 'PREP' },
  { level: 'mover', label: 'MOVER' },
  { level: '1', label: 'CLASS 1' },
  { level: '2', label: 'CLASS 2' },
  { level: '3', label: 'CLASS 3' },
  { level: '4', label: 'CLASS 4' },
  { level: '5', label: 'CLASS 5' },
];

const FALLBACK_SUBJECTS = ['English', 'Urdu', 'Math', 'G.K.', 'Islamiat', 'Drawing', 'Computer', 'Science'];
const FONT_OPTIONS = [
  'Inter, Arial, sans-serif',
  'Aptos, Inter, Arial, sans-serif',
  "'Segoe UI', Arial, sans-serif",
  "'Times New Roman', serif",
  "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
];
const ROW_FONT_OPTIONS = FONT_OPTIONS.filter((font) => !font.includes('Noto Nastaliq Urdu'));
const URDU_FONT = "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif";

const defaultRows: SubjectRow[] = [
  { id: 'eng', subject: 'ENGLISH', diary: 'Page 21 - Reading and writing practice', fontFamily: FONT_OPTIONS[0], textColor: '#1f2937' },
  { id: 'urdu', subject: 'URDU', diary: 'Page 25 - Writing practice', isUrdu: true, fontFamily: URDU_FONT, textColor: '#1f2937' },
  { id: 'math', subject: 'MATH', diary: 'Count and draw 5 medals', fontFamily: FONT_OPTIONS[0], textColor: '#1f2937' },
  { id: 'gk', subject: 'G.K.', diary: 'Write 4 lines about myself', fontFamily: FONT_OPTIONS[0], textColor: '#1f2937' },
];

function todayForInput() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

function safeRows(rows: unknown): SubjectRow[] {
  if (!Array.isArray(rows)) return defaultRows;
  const mapped = rows
    .map((row: any, index: number) => ({
      id: String(row?.id || `row_${index}_${Date.now()}`),
      subject: String(row?.subject || row?.title || '').trim(),
      diary: String(row?.diary || row?.note || '').trim(),
      isUrdu: Boolean(row?.isUrdu) || /urdu/i.test(String(row?.subject || row?.title || '')),
      fontFamily: String(row?.fontFamily || '').trim() || undefined,
      fontSize: row?.fontSize !== undefined ? Number(row.fontSize) : undefined,
      lineHeight: row?.lineHeight !== undefined ? Number(row.lineHeight) : undefined,
      textColor: String(row?.textColor || row?.color || '').trim() || undefined,
    }))
    .filter((row) => row.subject);
  return mapped.length ? mapped : defaultRows;
}

function titleCase(input: string) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function normalizeDateInput(value: string) {
  const iso = value.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  const dmy = value.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/);
  if (!dmy) return '';
  const day = dmy[1].padStart(2, '0');
  const month = dmy[2].padStart(2, '0');
  const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
  return `${year}-${month}-${day}`;
}

function parseDiaryText(text: string) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let detectedDate = '';
  let detectedClass = '';
  let detectedFooter = '';
  const rows: SubjectRow[] = [];

  for (const line of lines) {
    if (!detectedDate) {
      const dateHit = line.match(/(?:date|day)\s*[:\-]\s*(.+)$/i) || line.match(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/);
      if (dateHit) detectedDate = normalizeDateInput(dateHit[1] || dateHit[0]);
    }

    if (!detectedClass) {
      const classHit = line.match(/(?:class|grade)\s*[:\-]\s*(.+)$/i);
      if (classHit) detectedClass = classHit[1].trim();
    }

    if (!detectedFooter) {
      const footerHit = line.match(/^(?:footer|note|dua|parent note)\s*[:\-]\s*(.+)$/i);
      if (footerHit) detectedFooter = footerHit[1].trim();
    }

    const parts = line.split(/\s*[:|–—-]\s+/);
    if (parts.length >= 2) {
      const subject = titleCase(parts[0].trim());
      const diary = parts.slice(1).join(' - ').trim();
      if (subject && diary) {
        rows.push({
          id: `${subject}-${rows.length}`,
          subject: subject.toUpperCase(),
          diary,
          isUrdu: /urdu/i.test(subject),
          textColor: '#1f2937',
        });
      }
    }
  }

  return { rows: rows.length ? rows : defaultRows, detectedDate, detectedClass, detectedFooter };
}

function slipDensityClass(count: number) {
  return '';
}

function escapeHtml(value: string) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSlipMarkup({
  template,
  schoolName,
  tagline,
  logoUrl,
  classLabel,
  date,
  rows,
  footerText,
  footerIsUrdu,
  slipsPerPage,
  fontFamily,
  radius,
  headerFontSize,
  bodyFontSize,
  bodyLineHeight,
  bodyWordSpacing,
  headerLetterSpacing,
  textColor,
  showWatermark,
}: {
  template: Template;
  schoolName: string;
  tagline: string;
  logoUrl: string;
  classLabel: string;
  date: string;
  rows: SubjectRow[];
  footerText: string;
  footerIsUrdu: boolean;
  slipsPerPage: number;
  fontFamily: string;
  radius: number;
  headerFontSize: number;
  bodyFontSize: number;
  bodyLineHeight: number;
  bodyWordSpacing: number;
  headerLetterSpacing: number;
  textColor: string;
  showWatermark: boolean;
}) {
  const rowMarkup = rows
    .map((row, index) => {
      const subjectFontFamily = fontFamily;
      const rowFontFamily = row.fontFamily || fontFamily;
      const rowFontSize = row.fontSize ? `${row.fontSize}px` : 'var(--diary-body-font-size)';
      const rowLineHeight = row.lineHeight || 'var(--diary-body-line-height)';
      const rowTextColor = row.textColor || textColor;
      return `<div class="table-row">
        <div class="subject-pill" style="font-weight:${row.subjectBold ? 'bold' : 'normal'};background:${index % 2 ? template.even : '#ffffff'};color:${rowTextColor};font-family:${subjectFontFamily};font-size:var(--diary-body-font-size);line-height:var(--diary-body-line-height);word-spacing:var(--diary-body-word-spacing)">${escapeHtml(row.subject)}</div>
        <div class="${row.isUrdu ? 'task-pill urdu-text' : 'task-pill'}" style="background:${index % 2 ? template.even : '#ffffff'};color:${rowTextColor};font-family:${rowFontFamily};font-size:${rowFontSize};line-height:${rowLineHeight};word-spacing:var(--diary-body-word-spacing)">${escapeHtml(row.diary || '-')}</div>
      </div>`;
    })
    .join('');

  return `<div class="diary-card template-${template.headerStyle || 'classic'}${slipDensityClass(slipsPerPage)}" style="border-radius:${radius}px;font-family:${fontFamily};--diary-header-font-size:${headerFontSize}px;--diary-body-font-size:${bodyFontSize}px;--diary-body-line-height:${bodyLineHeight};--diary-body-word-spacing:${bodyWordSpacing}px;--diary-header-letter-spacing:${headerLetterSpacing}px;--accent:${template.accent || template.head}">
    <div class="hero" style="background:${template.hero};letter-spacing:var(--diary-header-letter-spacing)">
      ${template.motif ? `<div class="motif-badge">${escapeHtml(template.motif)}</div>` : ''}
      <div class="logo-box">${logoUrl ? `<img src="${escapeHtml(logoUrl.startsWith('http') || logoUrl.startsWith('blob:') || logoUrl.startsWith('data:') ? logoUrl : (logoUrl.startsWith('/') ? 'https://api.assps.edu.pk' + logoUrl : 'https://api.assps.edu.pk/' + logoUrl))}" alt="School logo" />` : '<span>ASS</span>'}</div>
      <div class="school-info">
        <div class="school-name" style="font-size:var(--diary-header-font-size)">${escapeHtml(schoolName)}</div>
        <div class="tagline">${escapeHtml(tagline)}</div>
      </div>
      <div class="date-box"><b>${escapeHtml(formatDateLabel(date))}</b><span>CLASS: ${escapeHtml(classLabel)}</span></div>
    </div>
    <div class="diary-table">
      <div class="table-head">
        <div style="background:${template.head}">SUBJECT</div>
        <div style="background:${template.head}">HOME TASK / DIARY</div>
      </div>
      ${rowMarkup}
    </div>
    <div class="${footerIsUrdu ? 'footer-note urdu-text' : 'footer-note'}" style="background:${template.footer}">${escapeHtml(footerText)}</div>
    ${showWatermark ? '<div class="watermark">ASS</div>' : ''}
  </div>`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function robustParseDiaryText(text: string, subjectHints: string[] = []) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const normalizedHints = Array.from(
    new Set(
      [...subjectHints, ...FALLBACK_SUBJECTS]
        .map((item) => String(item || '').trim())
        .filter(Boolean)
    )
  );
  const subjectPattern = normalizedHints.length
    ? new RegExp(`^(${normalizedHints.map(escapeRegExp).join('|')})\\b[\\s:.-]*(.*)$`, 'i')
    : null;

  const result = parseDiaryText(text);
  const parsedRows: SubjectRow[] = [];
  let currentRow: SubjectRow | null = null;

  const pushCurrent = () => {
    if (currentRow?.subject && currentRow.diary) parsedRows.push(currentRow);
    currentRow = null;
  };

  for (const line of lines) {
    if (/^(date|day|class|grade|footer|note|dua|parent note)\s*[:\-]/i.test(line)) continue;

    const subjectMatch = subjectPattern?.exec(line);
    if (subjectMatch) {
      pushCurrent();
      const subject = titleCase(subjectMatch[1].trim());
        currentRow = {
          id: `${subject}-${parsedRows.length}`,
          subject: subject.toUpperCase(),
          diary: subjectMatch[2].trim(),
          isUrdu: /urdu/i.test(subject),
          fontFamily: /urdu/i.test(subject) ? URDU_FONT : FONT_OPTIONS[0],
          textColor: '#1f2937',
        };
      continue;
    }

    const parts = line.split(/\s*[:|–—-]\s+/);
    if (parts.length >= 2) {
      pushCurrent();
      const subject = titleCase(parts[0].trim());
      currentRow = {
        id: `${subject}-${parsedRows.length}`,
        subject: subject.toUpperCase(),
        diary: parts.slice(1).join(' - ').trim(),
        isUrdu: /urdu/i.test(subject),
        fontFamily: /urdu/i.test(subject) ? URDU_FONT : FONT_OPTIONS[0],
        textColor: '#1f2937',
      };
      continue;
    }

    if (currentRow) currentRow.diary = `${currentRow.diary} ${line}`.trim();
  }

  pushCurrent();

  if (parsedRows.length) {
    return {
      rows: parsedRows,
      detectedDate: result.detectedDate,
      detectedClass: result.detectedClass,
      detectedFooter: result.detectedFooter,
    };
  }

  return {
    rows: [],
    detectedDate: result.detectedDate,
    detectedClass: result.detectedClass,
    detectedFooter: result.detectedFooter,
  };
}

function DiarySlip({
  template,
  schoolName,
  tagline,
  logoUrl,
  classLabel,
  date,
  rows,
  footerText,
  footerIsUrdu,
  slipsPerPage,
  fontFamily,
  radius,
  headerFontSize,
  bodyFontSize,
  bodyLineHeight,
  bodyWordSpacing,
  headerLetterSpacing,
  textColor,
  showWatermark,
  schoolNameFontSize,
  taglineFontSize,
  footerFontSize,
  logoSize,
}: {
  template: Template;
  schoolName: string;
  tagline: string;
  logoUrl: string;
  classLabel: string;
  date: string;
  rows: SubjectRow[];
  footerText: string;
  footerIsUrdu: boolean;
  slipsPerPage: number;
  fontFamily: string;
  radius: number;
  headerFontSize: number;
  bodyFontSize: number;
  bodyLineHeight: number;
  bodyWordSpacing: number;
  headerLetterSpacing: number;
  textColor: string;
  showWatermark: boolean;
  schoolNameFontSize?: number;
  taglineFontSize?: number;
  footerFontSize?: number;
  logoSize: number;
}) {
  return (
    <div
      className={`diary-card template-${template.headerStyle || 'classic'}${slipDensityClass(slipsPerPage)}`}
      style={{
        borderRadius: radius,
        fontFamily,
        ['--diary-header-font-size' as string]: `${headerFontSize}px`,
        ['--diary-body-font-size' as string]: `${bodyFontSize}px`,
        ['--diary-body-line-height' as string]: bodyLineHeight,
        ['--diary-body-word-spacing' as string]: `${bodyWordSpacing}px`,
        ['--diary-header-letter-spacing' as string]: `${headerLetterSpacing}px`,
        ['--diary-school-name-size' as string]: schoolNameFontSize ? `${schoolNameFontSize}px` : 'var(--diary-header-font-size)',
        ['--diary-tagline-size' as string]: taglineFontSize ? `${taglineFontSize}px` : 'calc(var(--diary-header-font-size) * 0.6)',
        ['--diary-footer-font-size' as string]: footerFontSize ? `${footerFontSize}px` : 'calc(var(--diary-body-font-size) * 0.65)',
        ['--diary-logo-size' as string]: `${logoSize}%`,
        ['--accent' as string]: template.accent || template.head,
      }}
    >
      <div className="hero" style={{ background: template.hero, letterSpacing: "var(--diary-header-letter-spacing)" }}>
        {template.motif && <div className="motif-badge">{template.motif}</div>}
        <div className="logo-box">{logoUrl ? <img src={logoUrl.startsWith('http') || logoUrl.startsWith('blob:') || logoUrl.startsWith('data:') ? logoUrl : (logoUrl.startsWith('/') ? 'https://api.assps.edu.pk' + logoUrl : 'https://api.assps.edu.pk/' + logoUrl)} alt="School logo" /> : <span>ASS</span>}</div>
        <div className="school-info">
          <div className="school-name" style={{ fontSize: "var(--diary-header-font-size)" }}>{schoolName}</div>
          <div className="tagline">{tagline}</div>
        </div>
        <div className="date-box">
          <b>{formatDateLabel(date)}</b>
          <span>CLASS: {classLabel}</span>
        </div>
      </div>

      <div className="diary-table">
        <div className="table-head">
          <div style={{ background: template.head }}>SUBJECT</div>
          <div style={{ background: template.head }}>HOME TASK / DIARY</div>
        </div>
        {rows.map((row, index) => (
          <div className="table-row" key={row.id}>
            <div
              className="subject-pill"
              style={{
                fontWeight: row.subjectBold ? 'bold' : 'normal',
                background: index % 2 ? template.even : '#ffffff',
                fontFamily,
                fontSize: 'var(--diary-body-font-size)',
                lineHeight: 'var(--diary-body-line-height)',
                wordSpacing: 'var(--diary-body-word-spacing)',
                color: row.textColor || textColor,
              }}
            >
              {row.subject}
            </div>
            <div
              className={row.isUrdu ? 'task-pill urdu-text' : 'task-pill'}
              style={{
                background: index % 2 ? template.even : '#ffffff',
                fontFamily: row.fontFamily || fontFamily,
                fontSize: row.fontSize ? `${row.fontSize}px` : 'var(--diary-body-font-size)',
                lineHeight: row.lineHeight || 'var(--diary-body-line-height)',
                wordSpacing: 'var(--diary-body-word-spacing)',
                color: row.textColor || textColor,
              }}
            >
              {row.diary || '-'}
            </div>
          </div>
        ))}
      </div>

      <div className={footerIsUrdu ? 'footer-note urdu-text' : 'footer-note'} style={{ background: template.footer }}>
        {footerText}
      </div>

      {showWatermark && <div className="watermark">ASS</div>}
    </div>
  );
}

export default function DailyDiaryFeature() {
  const { activeClasses, subjectsForClass } = useAcademicStore();
  const { paperSettings } = usePaperStore();

  const [templateId, setTemplateId] = useState(1);
  const [schoolName, setSchoolName] = useState('AL SIDDIQUE SCHOLARS PUBLIC SCHOOL');
  const [tagline, setTagline] = useState('Learn - Grow - Shine Every Day');
  const [logoUrl, setLogoUrl] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [date, setDate] = useState(todayForInput());
  const [slipsPerPage, setSlipsPerPage] = useState(8);
  const [footerText, setFooterText] = useState('Please review and sign the diary daily.');
  const [footerIsUrdu, setFooterIsUrdu] = useState(false);
  const [rows, setRows] = useState<SubjectRow[]>(defaultRows);
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0]);
  const [radius, setRadius] = useState(24);
  const [headerFontSize, setHeaderFontSize] = useState(13);
  const [bodyFontSize, setBodyFontSize] = useState(13);
  const [bodyLineHeight, setBodyLineHeight] = useState(1.45);
  const [bodyWordSpacing, setBodyWordSpacing] = useState(0);
  const [headerLetterSpacing, setHeaderLetterSpacing] = useState(0);
  const [showWatermark, setShowWatermark] = useState(true);
  const [schoolNameFontSize, setSchoolNameFontSize] = useState<number | undefined>(undefined);
  const [taglineFontSize, setTaglineFontSize] = useState<number | undefined>(undefined);
  const [footerFontSize, setFooterFontSize] = useState<number | undefined>(undefined);
  const [logoSize, setLogoSize] = useState(100);
  const [pasteText, setPasteText] = useState('');
  const [savedDiaryId, setSavedDiaryId] = useState<number | null>(null);
  const [savedDiaries, setSavedDiaries] = useState<DiaryRecord[]>([]);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const template = useMemo(() => templates.find((t) => t.id === templateId) || templates[0], [templateId]);
  const classOptions = activeClasses.length
    ? activeClasses.map((item) => ({ level: String(item.level), label: item.name }))
    : FALLBACK_CLASSES;
  const selectedClass = useMemo(() => classOptions.find((item) => String(item.level) === String(classLevel)) || classOptions[0], [classLevel, classOptions]);
  const classLabel = selectedClass?.label || classLevel || 'MOVER';
  const subjectOptions = useMemo(() => {
    const fromStore = subjectsForClass(classLevel || selectedClass?.level || '');
    return fromStore.length ? fromStore : FALLBACK_SUBJECTS;
  }, [classLevel, selectedClass?.level, subjectsForClass]);
  const slips = Array.from({ length: slipsPerPage }, (_, i) => i);
  const cols = 2;
  const gridRows = Math.ceil(slipsPerPage / cols);

  const hydrateDiary = (record: DiaryRecord) => {
    setSavedDiaryId(typeof record.id === 'number' ? record.id : null);
    if (record.template_id || record.templateId) setTemplateId(Number(record.template_id || record.templateId));
    if (record.school_name) setSchoolName(String(record.school_name));
    if (record.tagline) setTagline(String(record.tagline));
    if (record.logo_url) setLogoUrl(String(record.logo_url));
    if (record.class_level || record.class_name) setClassLevel(String(record.class_level || record.class_name));
    if (record.diary_date) setDate(String(record.diary_date).slice(0, 10));
    if (record.slips_per_page) setSlipsPerPage(Number(record.slips_per_page));
    if (record.footer_text !== undefined) setFooterText(String(record.footer_text));
    if (record.footer_is_urdu !== undefined) setFooterIsUrdu(Boolean(record.footer_is_urdu));
    const style = record.style_settings || {};
    if (style.radius !== undefined) setRadius(Number(style.radius));
    if (style.fontFamily !== undefined) setFontFamily(String(style.fontFamily));
    
    if (style.headerFontSize !== undefined) setHeaderFontSize(Number(style.headerFontSize));
    else if ((style as any).fontSize !== undefined) setHeaderFontSize(Number((style as any).fontSize));
    
    if (style.bodyFontSize !== undefined) setBodyFontSize(Number(style.bodyFontSize));
    else if ((style as any).fontSize !== undefined) setBodyFontSize(Number((style as any).fontSize));
    
    if (style.bodyLineHeight !== undefined) setBodyLineHeight(Number(style.bodyLineHeight));
    else if ((style as any).lineHeight !== undefined) setBodyLineHeight(Number((style as any).lineHeight));
    
    if (style.bodyWordSpacing !== undefined) setBodyWordSpacing(Number(style.bodyWordSpacing));
    else if ((style as any).wordSpacing !== undefined) setBodyWordSpacing(Number((style as any).wordSpacing));
    
    if (style.headerLetterSpacing !== undefined) setHeaderLetterSpacing(Number(style.headerLetterSpacing));
    else if ((style as any).letterSpacing !== undefined) setHeaderLetterSpacing(Number((style as any).letterSpacing));
    
    if ((style as any).schoolNameFontSize !== undefined) setSchoolNameFontSize(Number((style as any).schoolNameFontSize));
    else setSchoolNameFontSize(undefined);
    
    if ((style as any).taglineFontSize !== undefined) setTaglineFontSize(Number((style as any).taglineFontSize));
    else setTaglineFontSize(undefined);
    
    if ((style as any).footerFontSize !== undefined) setFooterFontSize(Number((style as any).footerFontSize));
    else setFooterFontSize(undefined);
    
    if ((style as any).logoSize !== undefined) setLogoSize(Number((style as any).logoSize));
    else setLogoSize(100);
    
    if (style.showWatermark !== undefined) setShowWatermark(Boolean(style.showWatermark));
    if (record.rows) setRows(safeRows(record.rows));
  };

  async function loadSavedDiaries() {
    const res = await api.get('/daily-diary?limit=10');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  }

  useEffect(() => {
    if (!classLevel && selectedClass?.level) setClassLevel(String(selectedClass.level));
  }, [classLevel, selectedClass?.level]);

  useEffect(() => {
    const savedPaperSettings = paperSettings || {};
    if (savedPaperSettings.schoolName) setSchoolName(savedPaperSettings.schoolName);
    if (savedPaperSettings.logo) setLogoUrl(savedPaperSettings.logo);
  }, [paperSettings]);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const local = typeof window !== 'undefined' ? window.localStorage.getItem('dailyDiaryDraft') : null;
        if (local) {
          const parsed = JSON.parse(local);
          if (!cancelled) hydrateDiary(parsed);
        }
      } catch {
        // ignore
      }

      try {
        const publicParams = paperSettings?.schoolCode ? { school_code: paperSettings.schoolCode } : undefined;
        const res = await api.get('/settings/public', { params: publicParams });
        const settings = res.data?.data || {};
        if (cancelled) return;
        if (settings.school_name) setSchoolName(String(settings.school_name));
        if (settings.school_logo) setLogoUrl(String(settings.school_logo));
      } catch {
        // optional
      }

      try {
        const diaries = await loadSavedDiaries();
        if (cancelled) return;
        setSavedDiaries(diaries);
        const latest = diaries[0];
        if (latest && typeof window !== 'undefined' && !window.localStorage.getItem('dailyDiaryDraft')) {
          hydrateDiary(latest);
        }
      } catch {
        // offline/local state still works
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateRow(id: string, key: keyof SubjectRow, value: string | boolean) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  }

  function setRowFontFamily(id: string, fontFamily: string) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, fontFamily } : row)));
  }

  function nudgeRowFontSize(id: string, delta: number) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, fontSize: Math.min(18, Math.max(11, (row.fontSize || bodyFontSize) + delta)) } : row)));
  }

  function applyGlobalFontFamily(value: string) {
    setFontFamily(value);
  }

  

  

  function addSubject(subject: string) {
    const normalized = subject.trim();
    if (!normalized) return;
    if (rows.some((row) => row.subject.toLowerCase() === normalized.toLowerCase())) return;
    const isUrdu = normalized.toLowerCase() === 'urdu';
    setRows((prev) => [...prev, {
      id: `${normalized}-${Date.now()}`,
      subject: normalized.toUpperCase(),
      diary: '',
      isUrdu,
      fontFamily: isUrdu ? URDU_FONT : fontFamily,
      textColor: '#1f2937',
    }]);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function applyPasteText() {
    const parsed = robustParseDiaryText(pasteText, subjectOptions);
    if (parsed.detectedDate) setDate(parsed.detectedDate);
    if (parsed.detectedClass) setClassLevel(parsed.detectedClass);
    if (parsed.detectedFooter) setFooterText(parsed.detectedFooter);
    if (!parsed.rows.length) {
      setStatus('No diary rows detected. Use lines like "English: ..." or add rows manually.');
      window.setTimeout(() => setStatus(''), 3500);
      return;
    }
    setRows(parsed.rows);
    setStatus(`Diary arranged into ${parsed.rows.length} row${parsed.rows.length === 1 ? '' : 's'}.`);
    window.setTimeout(() => setStatus(''), 2500);
  }

  async function saveDailyDiary() {
    const payload = {
      id: savedDiaryId || undefined,
      template_id: templateId,
      school_name: schoolName,
      tagline,
      logo_url: logoUrl,
      class_level: classLevel,
      class_name: classLabel,
      diary_date: date,
      slips_per_page: slipsPerPage,
      footer_text: footerText,
      footer_is_urdu: footerIsUrdu,
      rows,
      style_settings: {
        radius,
        headerFontSize,
        bodyFontSize,
        schoolNameFontSize,
        taglineFontSize,
        footerFontSize,
        logoSize,
        fontFamily,
        bodyLineHeight,
        bodyWordSpacing,
        headerLetterSpacing,
        showWatermark,
      },
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('dailyDiaryDraft', JSON.stringify(payload));
    }

    setSaving(true);
    setStatus('Saving...');
    try {
      const response = savedDiaryId ? await api.put(`/daily-diary/${savedDiaryId}`, payload) : await api.post('/daily-diary', payload);
      const saved = response.data?.data;
      if (saved?.id) {
        setSavedDiaryId(Number(saved.id));
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('dailyDiaryDraft', JSON.stringify({ ...payload, id: saved.id }));
        }
      }
      const diaries = await loadSavedDiaries().catch(() => []);
      if (Array.isArray(diaries)) setSavedDiaries(diaries);
      setStatus('Draft saved successfully.');
    } catch {
      setStatus('Server save failed. Draft kept locally, but it is not saved in SaaS until backend confirms.');
    } finally {
      setSaving(false);
      window.setTimeout(() => setStatus(''), 4000);
    }
  }

  function handleLogoUpload(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function openSavedDiary(record: DiaryRecord) {
    hydrateDiary(record);
    setStatus(`Loaded diary ${record.id || ''}`.trim());
    window.setTimeout(() => setStatus(''), 3000);
  }

  async function deleteSavedDiary(record: DiaryRecord) {
    if (!record.id) return;
    if (!window.confirm('Delete this saved diary draft?')) return;

    try {
      await api.delete(`/daily-diary/${record.id}`);
      const diaries = await loadSavedDiaries().catch(() => []);
      setSavedDiaries(Array.isArray(diaries) ? diaries : []);
      if (savedDiaryId === record.id) setSavedDiaryId(null);
      setStatus('Draft deleted.');
      window.setTimeout(() => setStatus(''), 2500);
    } catch {
      setStatus('Could not delete the selected draft.');
      window.setTimeout(() => setStatus(''), 3500);
    }
  }

  function handlePrintDiary() {
    if (typeof window === 'undefined') return;
    const slipsHtml = Array.from({ length: slipsPerPage }, () => renderSlipMarkup({
      template,
      schoolName,
      tagline,
      logoUrl,
      classLabel,
      date,
      rows,
      footerText,
      footerIsUrdu,
      slipsPerPage,
      fontFamily,
      radius,
      headerFontSize,
      bodyFontSize,
      bodyLineHeight,
      bodyWordSpacing,
      headerLetterSpacing,
      textColor: '#1f2937',
      showWatermark,
    })).join('');

    const printHtml = `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Daily Diary Print</title>
          <style>${css}</style>
          <style>
            body{margin:0;background:#0b1728}
            .print-toolbar{position:sticky;top:0;z-index:9999;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;background:#071e34;color:#e2e8f0;border-bottom:1px solid rgba(148,163,184,.25);font-family:Inter,Arial,sans-serif}
            .print-toolbar button{border:0;border-radius:10px;padding:10px 16px;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#C8991A,#e8b420);color:#071e34}
            .print-shell{padding:18px 0 28px;background:#fff}
            @media print{body{background:#fff}.print-toolbar{display:none!important}.print-shell{padding:0}}
          </style>
        </head>
        <body onload="setTimeout(function(){ window.focus(); window.print(); }, 700)">
          <div class="print-toolbar">
            <strong>Daily Diary Print Preview</strong>
            <button onclick="window.focus(); window.print();">Print / Save PDF</button>
          </div>
          <div class="print-shell">
          <div class="daily-diary-feature">
            <div class="print-sheet" style="grid-template-columns:repeat(2,minmax(0,1fr)); grid-template-rows:repeat(${gridRows}, minmax(0,1fr))">
              ${slipsHtml}
            </div>
          </div>
          </div>
        </body>
      </html>`;

    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) {
      setStatus('Print preview popup was blocked. Please allow popups and click Print Preview again.');
      window.setTimeout(() => setStatus(''), 4500);
      return;
    }
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }

  return (
    <div className="daily-diary-feature">
      <style>{css}</style>

      <div className="no-print page-header">
        <div>
          <div className="eyebrow">Daily Diary Generator</div>
          <h1>Daily Diary Generator</h1>
          <p>Paste diary content, auto-arrange subjects, fine tune typography, and print a clean A4 sheet without changing the provided template styles.</p>
        </div>
        <div className="actions">
          <button onClick={saveDailyDiary} disabled={saving}>{saving ? 'Saving...' : 'Save Diary'}</button>
          <button onClick={handlePrintDiary} className="primary">Print Preview</button>
        </div>
      </div>

      {status && <div className="no-print status-bar">{status}</div>}

      <div className="no-print designer-layout">
        <div className="stack-column left-column">
          <section className="panel accent-panel">
            <div className="panel-title">
              <h2>Branding</h2>
              <span>School header and date</span>
            </div>
            <label>School Name</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <input style={{ flex: 1, margin: 0 }} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
              <div className="font-size-tools" style={{ flexShrink: 0 }}>
                <button type="button" onClick={() => setSchoolNameFontSize(Math.max(8, (schoolNameFontSize || headerFontSize) - 1))}>A-</button>
                <span>{schoolNameFontSize || headerFontSize}px</span>
                <button type="button" onClick={() => setSchoolNameFontSize(Math.min(32, (schoolNameFontSize || headerFontSize) + 1))}>A+</button>
              </div>
            </div>
            <label>Tagline</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <input style={{ flex: 1, margin: 0 }} value={tagline} onChange={(e) => setTagline(e.target.value)} />
              <div className="font-size-tools" style={{ flexShrink: 0 }}>
                <button type="button" onClick={() => setTaglineFontSize(Math.max(6, (taglineFontSize || Math.round(headerFontSize * 0.6)) - 1))}>A-</button>
                <span>{taglineFontSize || Math.round(headerFontSize * 0.6)}px</span>
                <button type="button" onClick={() => setTaglineFontSize(Math.min(24, (taglineFontSize || Math.round(headerFontSize * 0.6)) + 1))}>A+</button>
              </div>
            </div>
            <label>School Logo</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <div className="helper-copy" style={{ flex: 1, margin: 0 }}>School logo is pulled from your SaaS settings.</div>
              <div className="font-size-tools" style={{ flexShrink: 0 }}>
                <button type="button" onClick={() => setLogoSize(Math.max(30, logoSize - 5))}>A-</button>
                <span>{logoSize}%</span>
                <button type="button" onClick={() => setLogoSize(Math.min(200, logoSize + 5))}>A+</button>
              </div>
            </div>
            <div className="two-col">
              <label>Class
                <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
                  {classOptions.map((item) => <option key={item.level} value={item.level}>{item.label}</option>)}
                </select>
              </label>
              <label>Date
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
            </div>
          </section>

          <section className="panel accent-panel">
            <div className="panel-title">
              <h2>Layout</h2>
              <span>Templates, fonts, and spacing</span>
            </div>
            <label>Template
              <select value={templateId} onChange={(e) => setTemplateId(Number(e.target.value))}>
                {templates.map((item) => <option value={item.id} key={item.id}>{item.id}. {item.name}</option>)}
              </select>
            </label>
            <label>Font Family
              <select value={fontFamily} onChange={(e) => applyGlobalFontFamily(e.target.value)}>
                {FONT_OPTIONS.map((font) => <option key={font} value={font}>{font.replace(/'/g, '')}</option>)}
              </select>
            </label>
            <label>Slips per Portrait A4
              <select value={slipsPerPage} onChange={(e) => setSlipsPerPage(Number(e.target.value))}>
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8 - Default</option>
                <option value={10}>10 - Compact</option>
                <option value={12}>12 - Dense</option>
                <option value={14}>14 - Ultra Compact</option>
              </select>
            </label>
              {slipsPerPage >= 14 && rows.length > 4 && (
                <div className="compose-warning" style={{marginTop: "8px"}}>Content is too large for 14 diaries per page. Reduce font size or select fewer diaries per page.</div>
              )}
            <div className="slider-grid">
              <label>Border Radius<input type="range" min="12" max="34" value={radius} onChange={(e) => setRadius(Number(e.target.value))} /></label>
              <label>Body Line Space<input type="range" min="0.9" max="1.7" step="0.02" value={bodyLineHeight} onChange={(e) => setBodyLineHeight(Number(e.target.value))} /></label>
              <label>Body Word Space<input type="range" min="-2" max="8" value={bodyWordSpacing} onChange={(e) => setBodyWordSpacing(Number(e.target.value))} /></label>
              <label>Header Letter Space<input type="range" min="-1" max="5" step="0.1" value={headerLetterSpacing} onChange={(e) => setHeaderLetterSpacing(Number(e.target.value))} /></label>
            </div>
            <label className="check"><input type="checkbox" checked={showWatermark} onChange={(e) => setShowWatermark(e.target.checked)} /> Show watermark</label>
          </section>
        </div>

        <div className="stack-column right-column">
          <section className="panel accent-panel drafts-panel">
            <div className="panel-title">
              <h2>Saved Diaries</h2>
              <span>Open or delete saved diaries</span>
            </div>
            <div className="draft-list">
              {savedDiaries.length ? savedDiaries.map((record) => (
                <div key={record.id} className="draft-item">
                  <button type="button" onClick={() => openSavedDiary(record)} className="draft-open">
                    <div className="draft-title">{record.class_name || record.class_level || 'Diary'} - {record.diary_date ? formatDateLabel(record.diary_date) : 'No date'}</div>
                    <div className="draft-meta">Template {record.template_id || record.templateId || 1} - {record.footer_text ? 'Has footer note' : 'No footer note'}</div>
                  </button>
                  <button type="button" onClick={() => deleteSavedDiary(record)} className="danger draft-delete">Delete</button>
                </div>
              )) : (
                <div className="empty-copy">No saved diaries yet. Save a diary to see it here.</div>
              )}
            </div>
          </section>

          <section className="panel accent-panel">
            <div className="panel-title">
              <h2>Diary Composer</h2>
              <span>Paste content or edit rows manually</span>
            </div>
            <div className="compose-grid">
              <div className="compose-box">
                <label>Paste Diary Text
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={'Example:\nDate: 22/05/2026\nClass: Nursery\nEnglish: Page 21 - Reading and writing practice\nUrdu: Page 25 - Writing practice\nMath: Count and draw 5 medals\nG.K.: Write 4 lines about myself\nFooter: Please review and sign the diary daily.'}
                  />
                </label>
                <div className="compose-actions">
                  <button type="button" onClick={applyPasteText} className="primary">Auto Arrange</button>
                  <button type="button" onClick={() => setRows(defaultRows)} className="ghost">Reset Rows</button>
                </div>
                {status.includes('No diary rows detected') && (
                  <div className="compose-warning">{status}</div>
                )}
              </div>
              <div className="subject-panel">
                <div className="subject-buttons">
                  {subjectOptions.map((subject) => (
                    <button key={subject} onClick={() => addSubject(subject)} type="button">+ {subject}</button>
                  ))}
                </div>
                <div className="rows-editor">
                  {rows.map((row) => (
                    <div className="edit-row" key={row.id}>
                      <input
                        value={row.subject}
                        onChange={(e) => updateRow(row.id, 'subject', e.target.value)}
                        style={{ color: row.textColor || '#1f2937' }}
                      />
                      <textarea
                        value={row.diary}
                        onChange={(e) => updateRow(row.id, 'diary', e.target.value)}
                        style={{ color: row.textColor || '#1f2937' }}
                      />
                      <div className="row-tools">
                        <select
                          value={row.isUrdu ? URDU_FONT : (row.fontFamily || fontFamily)}
                          onChange={(e) => setRowFontFamily(row.id, e.target.value)}
                          disabled={row.isUrdu}
                          title={row.isUrdu ? 'Urdu rows keep the Urdu font' : 'Row font family'}
                        >
                          {ROW_FONT_OPTIONS.map((font) => <option key={font} value={font}>{font.replace(/'/g, '')}</option>)}
                          <option value={URDU_FONT}>{URDU_FONT.replace(/'/g, '')}</option>
                        </select>
                        <div className="font-size-tools">
                          <button type="button" onClick={() => nudgeRowFontSize(row.id, -1)} aria-label="Decrease font size">A-</button>
                          <span>{row.fontSize || bodyFontSize}px</span>
                          <button type="button" onClick={() => nudgeRowFontSize(row.id, 1)} aria-label="Increase font size">A+</button>
                        </div>
                        <label className="row-color-tool" title="Text color">
                          <span />
                          <input
                            type="color"
                            value={row.textColor || '#1f2937'}
                            onChange={(e) => updateRow(row.id, 'textColor', e.target.value)}
                          />
                        </label>
                      </div>
                      <div className="edit-actions">
                        <label className="check small"><input type="checkbox" checked={!!row.isUrdu} onChange={(e) => {
                          const checked = e.target.checked;
                          updateRow(row.id, 'isUrdu', checked);
                          if (checked) setRowFontFamily(row.id, URDU_FONT);
                        }} /> Urdu</label>
                        <label className="check small"><input type="checkbox" checked={!!row.subjectBold} onChange={(e) => updateRow(row.id, 'subjectBold', e.target.checked)} /> Bold Subj</label>
                        <button onClick={() => removeRow(row.id)} type="button" className="danger">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <label>Footer / Dua / Fee Note / Parent Note</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '12px' }}>
              <textarea style={{ flex: 1, margin: 0, minHeight: '40px' }} value={footerText} onChange={(e) => setFooterText(e.target.value)} />
              <div className="font-size-tools" style={{ flexShrink: 0, marginTop: '2px' }}>
                <button type="button" onClick={() => setFooterFontSize(Math.max(6, (footerFontSize || Math.round(bodyFontSize * 0.65)) - 1))}>A-</button>
                <span>{footerFontSize || Math.round(bodyFontSize * 0.65)}px</span>
                <button type="button" onClick={() => setFooterFontSize(Math.min(24, (footerFontSize || Math.round(bodyFontSize * 0.65)) + 1))}>A+</button>
              </div>
            </div>
            <label className="check"><input type="checkbox" checked={footerIsUrdu} onChange={(e) => setFooterIsUrdu(e.target.checked)} /> Use Urdu font for footer</label>
          </section>
        </div>
      </div>

      <div className="print-sheet" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))` }}>
        {slips.map((n) => (
          <DiarySlip
            key={n}
            template={template}
            schoolName={schoolName}
            tagline={tagline}
            logoUrl={logoUrl}
            classLabel={classLabel}
            date={date}
            rows={rows}
            footerText={footerText}
            footerIsUrdu={footerIsUrdu}
            slipsPerPage={slipsPerPage}
            fontFamily={fontFamily}
            radius={radius}
            headerFontSize={headerFontSize}
            bodyFontSize={bodyFontSize}
            bodyLineHeight={bodyLineHeight}
            bodyWordSpacing={bodyWordSpacing}
            headerLetterSpacing={headerLetterSpacing}
            textColor="#1f2937"
            showWatermark={showWatermark}
            schoolNameFontSize={schoolNameFontSize}
            taglineFontSize={taglineFontSize}
            footerFontSize={footerFontSize}
            logoSize={logoSize}
          />
        ))}
      </div>
    </div>
  );
}

const css = `
.daily-diary-feature,.daily-diary-feature *{box-sizing:border-box}
.daily-diary-feature{background:linear-gradient(180deg,#081d34 0%,#07111f 100%);min-height:100vh;padding:22px;color:#d8e2f0;font-family:Inter,Arial,sans-serif}
.page-header{display:flex;justify-content:space-between;gap:16px;align-items:center;max-width:1480px;margin:0 auto 18px;padding:18px 22px;border:1px solid rgba(148,163,184,.12);border-radius:24px;background:rgba(11,44,77,.92);box-shadow:0 20px 50px rgba(7,17,31,.28)}
.eyebrow{color:#C8991A;font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;margin-bottom:8px}
.page-header h1{margin:0;font-size:34px;font-weight:1000;letter-spacing:-.8px;color:#fff}
.page-header p{max-width:930px;margin:8px 0 0;color:#94A3B8;line-height:1.65}
.actions{display:flex;gap:10px;align-self:flex-start;flex-wrap:wrap}
.status-bar{max-width:1480px;margin:0 auto 14px;padding:10px 14px;border-radius:14px;background:rgba(10,132,255,.14);border:1px solid rgba(10,132,255,.24);color:#7fc0ff;font-weight:700}
button{border:0;border-radius:14px;padding:10px 14px;font-weight:900;background:rgba(255,255,255,.06);color:#d8e2f0;box-shadow:0 10px 20px rgba(0,0,0,.12);cursor:pointer}
button:disabled{opacity:.65;cursor:not-allowed}
.primary{background:linear-gradient(135deg,#C8991A,#e8b420);color:#071e34}
.ghost{background:transparent;border:1px solid rgba(148,163,184,.18);box-shadow:none}
.danger{background:rgba(255,55,95,.12);border:1px solid rgba(255,55,95,.22);color:#ff7b91}
.designer-layout{max-width:1480px;margin:0 auto 18px;display:grid;grid-template-columns:minmax(280px,340px) minmax(0,1fr);gap:16px;align-items:start}
.stack-column{display:grid;gap:16px;align-content:start}
.right-column{grid-column:2}
.left-column{grid-column:1}
.panel{background:rgba(11,44,77,.92);border:1px solid rgba(148,163,184,.12);border-radius:24px;padding:18px;box-shadow:0 18px 44px rgba(7,17,31,.22)}
.accent-panel{background:linear-gradient(180deg,rgba(11,44,77,.95),rgba(9,28,50,.96))}
.panel-title{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:12px}
.panel-title h2{margin:0;font-size:17px;color:#fff}
.panel-title span{font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:.08em}
.drafts-panel{margin-top:2px}
.panel label{display:block;font-size:12px;font-weight:900;color:#C0C8D8;margin-bottom:10px}
.panel input,.panel select,.panel textarea{width:100%;margin-top:6px;border:1px solid rgba(148,163,184,.18);border-radius:14px;padding:11px 12px;font:inherit;background:rgba(7,30,52,.72);color:#fff;box-sizing:border-box}
.panel textarea{min-height:78px;resize:vertical}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.check{display:flex!important;align-items:center;gap:8px}
.check input{width:auto!important;margin:0!important}
.small{font-size:11px!important;margin:0!important}
.slider-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.slider-grid label{margin-bottom:0}
.draft-list{display:grid;gap:10px}
.draft-item{padding:12px;border-radius:16px;border:1px solid rgba(148,163,184,.12);background:rgba(7,30,52,.55);display:grid;gap:10px}
.draft-open{text-align:left;background:transparent;border:0;padding:0;box-shadow:none}
.draft-title{font-weight:900;color:#fff;font-size:13px;line-height:1.4}
.draft-meta{margin-top:4px;color:#94A3B8;font-size:11px;font-weight:700}
.draft-delete{width:100%;padding:9px 12px;font-size:12px}
.empty-copy{color:#94A3B8;font-size:13px;line-height:1.65}
.compose-grid{display:grid;grid-template-columns:1fr;gap:14px;margin-bottom:14px;align-items:start}
.compose-box,.subject-panel{border-radius:18px;border:1px solid rgba(148,163,184,.12);background:rgba(7,30,52,.48);padding:14px;min-width:0}
.compose-actions{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}
.compose-actions button{flex:1;min-width:140px}
.subject-buttons{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:8px;margin-bottom:12px}
.subject-buttons button{padding:8px 10px;font-size:12px;background:rgba(255,255,255,.06);width:100%;justify-content:center}
.rows-editor{display:grid;gap:10px}
.edit-row{display:grid;grid-template-columns:minmax(0,1fr) 180px;grid-template-areas:"subject actions" "diary actions" "tools actions";gap:10px 14px;align-items:start;min-width:0;padding:12px;border:1px solid rgba(148,163,184,.08);border-radius:16px;background:rgba(255,255,255,.03)}
.edit-row input{grid-area:subject;margin-top:0}
.edit-row textarea{grid-area:diary;margin-top:0;min-height:72px;line-height:1.55;overflow-wrap:anywhere;word-break:break-word}
.row-tools{grid-area:tools;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;min-width:0}
.row-tools select,.row-tools .font-size-tools{margin-top:0}
.font-size-tools{display:flex;align-items:center;gap:8px;justify-content:space-between;border:1px solid rgba(148,163,184,.12);border-radius:12px;padding:8px 10px;background:rgba(255,255,255,.02);color:#d8e2f0}
.font-size-tools button{padding:6px 10px;border-radius:10px;font-size:12px;line-height:1;background:rgba(255,255,255,.05)}
.font-size-tools span{font-size:12px;font-weight:800;color:#94A3B8;min-width:46px;text-align:center}
.row-color-tool{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:8px 10px;border:1px solid rgba(148,163,184,.12);border-radius:12px;background:rgba(255,255,255,.02);min-width:0}
.row-color-tool span{width:10px;height:10px;border-radius:50%;background:#94A3B8;box-shadow:0 0 10px rgba(148,163,184,.24)}
.row-color-tool input[type="color"]{width:34px;height:28px;border:0;background:transparent;padding:0;cursor:pointer}
.edit-actions{grid-area:actions;display:grid;grid-template-columns:minmax(0,1fr) 110px;gap:10px;align-items:center;min-width:0}
.edit-actions .check{white-space:nowrap;min-width:0;overflow:hidden;text-overflow:ellipsis;padding:10px 12px;border:1px solid rgba(148,163,184,.12);border-radius:12px;background:rgba(255,255,255,.03)}
.edit-actions .danger{width:100%;min-width:0}
.compose-warning{margin-top:10px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,193,7,.2);background:rgba(255,193,7,.08);color:#ffd37a;font-size:12px;font-weight:800;line-height:1.5}
.helper-copy{font-size:11px;color:#94A3B8;line-height:1.5;margin-top:-2px;padding:10px 12px;border:1px dashed rgba(148,163,184,.12);border-radius:12px;background:rgba(255,255,255,.02)}
.print-sheet{width:210mm;height:297mm;max-height:297mm;background:white;margin:0 auto;padding:6mm;display:grid;gap:2mm;box-sizing:border-box;overflow:hidden}
.diary-card{position:relative;overflow:hidden;background:#fff;border:1px solid rgba(15,23,42,.12);display:flex;flex-direction:column;height:100%;min-height:0;filter:saturate(1.14) contrast(1.08)}
.hero{position:relative;padding:5px 6px;display:flex;align-items:center;gap:5px;color:white;flex-shrink:0;isolation:isolate}
.hero:after{content:"";position:absolute;inset:auto 0 0 0;height:3px;background:var(--accent);opacity:.9;z-index:-1}
.template-ribbon .hero{padding-left:8px}
.template-ribbon .hero:before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--accent);opacity:.95}
.template-split .hero{background-blend-mode:normal}
.template-split .date-box{border-left:2px solid rgba(255,255,255,.32);padding-left:6px}
.template-badge .logo-box{border:2px solid var(--accent)}
.motif-badge{min-width:30px;height:22px;border-radius:999px;background:rgba(255,255,255,.94);color:#102033;display:grid;place-items:center;padding:0 6px;font-size:7px;font-weight:1000;letter-spacing:.06em;box-shadow:0 7px 16px rgba(0,0,0,.16)}
.logo-box{width:36px;height:36px;min-width:36px;border-radius:12px;background:white;display:grid;place-items:center;box-shadow:0 8px 18px rgba(0,0,0,.16);overflow:hidden}
.logo-box img{width:var(--diary-logo-size, 100%);height:var(--diary-logo-size, 100%);object-fit:contain}
.logo-box span{font-weight:1000;color:#111827}
.school-info{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center}
.school-name{font-size:var(--diary-school-name-size);font-weight:1000;line-height:1.1;letter-spacing:-.2px;text-transform:uppercase}
.tagline{font-size:var(--diary-tagline-size);font-weight:800;opacity:.9;margin-top:2px;text-transform:uppercase}
.date-box{text-align:right;font-size:calc(var(--diary-header-font-size) * 0.65);line-height:1.3;font-weight:900}
.date-box span{display:block}
.diary-table{margin:2px 3px;border-radius:9px;overflow:hidden;border:1px solid rgba(15,23,42,.16);display:flex;flex-direction:column;flex:1;min-height:0}
.table-head{display:grid;grid-template-columns:minmax(60px,.24fr) minmax(0,1fr);gap:1px;padding:1px;flex-shrink:0}
.table-head div{padding:2px 4px;border-radius:7px;color:white;text-align:center;font-size:calc(var(--diary-body-font-size) * 0.6);font-weight:1000;letter-spacing:.2px;display:flex;align-items:center;justify-content:center}
.table-row{display:grid;grid-template-columns:minmax(60px,.24fr) minmax(0,1fr);gap:1px;padding:1px;flex:1;min-height:0}
.subject-pill,.task-pill{border-radius:7px;border:1px solid rgba(15,23,42,.12);box-shadow:0 1px 4px rgba(15,23,42,.04);padding:2px 4px;display:flex;align-items:center;overflow:hidden;word-break:break-word}
.subject-pill{justify-content:center;text-align:center;font-weight:1000;text-transform:uppercase}
.task-pill{font-weight:700}
.urdu-text{font-family:"Noto Nastaliq Urdu","Jameel Noori Nastaleeq",serif;direction:rtl;font-size:1em;line-height:1.25}
.footer-note{margin:1px 4px 3px;border-radius:7px;padding:2px 4px;text-align:center;font-weight:900;flex-shrink:0;font-size:var(--diary-footer-font-size);line-height:1.2;color:#1f2937;border:1px solid rgba(15,23,42,.08);min-height:16px;display:flex;align-items:center;justify-content:center}
.watermark{position:absolute;right:-14px;bottom:-22px;font-size:78px;font-weight:1000;opacity:.03;pointer-events:none}
@media(max-width:1200px){.designer-layout{grid-template-columns:1fr}.left-column,.right-column{grid-column:auto}.compose-grid{grid-template-columns:1fr}.page-header{display:block}.actions{margin-top:12px}.print-sheet{width:100%;height:auto;max-height:none}.edit-row{grid-template-columns:1fr;grid-template-areas:"subject" "diary" "tools" "actions"}.row-tools{grid-template-columns:1fr}.font-size-tools{justify-content:flex-start}.edit-actions{grid-template-columns:1fr}.edit-actions .check{white-space:normal}}
@media print{
  @page { size: A4 portrait; margin: 0; }
  .no-print { display:none !important; }
  body { margin: 0; padding: 0; background: white; width: 210mm; height: 297mm; }
  .daily-diary-feature { padding: 0; background: white; min-height: 0; }
  .print-sheet {
    width: 210mm;
    height: 297mm;
    max-height: 297mm;
    margin: 0;
    padding: 6mm 4mm;
    box-sizing: border-box;
    box-shadow: none;
    border: none;
    gap: 2mm;
    overflow: hidden;
  }
  .diary-card {
    box-shadow: none;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .hero { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .table-head div, .footer-note, .subject-pill, .task-pill {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}`;

'use client'
import { useState, useEffect } from 'react'
import api from '@/utils/api'

const AK = 'al_siddique_academic'

const DEFAULT_ACADEMIC = {
  classes: [
    { level: 'nursery', name: 'Nursery',  active: true,  sections: ['Blue','Red','Green'] },
    { level: 'kg',      name: 'KG',       active: true,  sections: ['Blue','Red','Green'] },
    { level: '1',  name: 'Class 1',  active: true,  sections: ['Blue','Red','Green'] },
    { level: '2',  name: 'Class 2',  active: true,  sections: ['Blue','Red','Green'] },
    { level: '3',  name: 'Class 3',  active: true,  sections: ['Blue','Red','Green'] },
    { level: '4',  name: 'Class 4',  active: true,  sections: ['Blue','Red','Green'] },
    { level: '5',  name: 'Class 5',  active: true,  sections: ['Blue','Red','Green'] },
    { level: '6',  name: 'Class 6',  active: true,  sections: ['Blue','Red','Green'] },
    { level: '7',  name: 'Class 7',  active: true,  sections: ['Blue','Red','Green'] },
    { level: '8',  name: 'Class 8',  active: true,  sections: ['Blue','Red','Green'] },
    { level: '9',  name: 'Class 9',  active: true,  sections: ['Blue','Red'] },
    { level: '10', name: 'Class 10', active: true,  sections: ['Blue','Red'] },
  ],
  subjects: [
    { id: 'sb1',  name: 'Mathematics',     classes: ['1','2','3','4','5','6','7','8','9','10'] },
    { id: 'sb2',  name: 'English',         classes: ['1','2','3','4','5','6','7','8','9','10'] },
    { id: 'sb3',  name: 'Urdu',            classes: ['1','2','3','4','5','6','7','8','9','10'] },
    { id: 'sb4',  name: 'Science',         classes: ['1','2','3','4','5','6','7','8'] },
    { id: 'sb5',  name: 'Islamiyat',       classes: ['1','2','3','4','5','6','7','8','9','10'] },
    { id: 'sb6',  name: 'Social Studies',  classes: ['1','2','3','4','5','6','7','8'] },
    { id: 'sb7',  name: 'Computer',        classes: ['5','6','7','8','9','10'] },
    { id: 'sb8',  name: 'Physics',         classes: ['9','10'] },
    { id: 'sb9',  name: 'Chemistry',       classes: ['9','10'] },
    { id: 'sb10', name: 'Biology',         classes: ['9','10'] },
    { id: 'sb11', name: 'General Science', classes: ['9','10'] },
    { id: 'sb12', name: 'Quran / Nazra',   classes: ['1','2','3','4','5','6','7','8'] },
  ],
}

function load() {
  try {
    if (typeof window === 'undefined') return DEFAULT_ACADEMIC
    const raw = localStorage.getItem(AK)
    if (!raw) return DEFAULT_ACADEMIC
    const saved = JSON.parse(raw)
    return {
      classes:  saved.classes  || DEFAULT_ACADEMIC.classes,
      subjects: saved.subjects || DEFAULT_ACADEMIC.subjects,
    }
  } catch { return DEFAULT_ACADEMIC }
}

function normalizeApiClass(item, index) {
  const name = String(item?.name || item?.class_name || item?.label || '').trim()
  if (!name) return null
  const level = String(item?.level || item?.class_level || item?.id || name || index).trim()
  const sections = Array.isArray(item?.sections)
    ? item.sections
    : item?.section
      ? [item.section]
      : item?.section_name
        ? [item.section_name]
        : []

  return {
    level,
    name,
    active: item?.active !== false,
    sections,
  }
}

function mergeLiveAcademic(localData, liveClasses) {
  if (!Array.isArray(liveClasses) || !liveClasses.length) return localData

  const classMap = new Map()
  for (const [index, item] of liveClasses.entries()) {
    const normalized = normalizeApiClass(item, index)
    if (!normalized) continue
    const key = normalized.name.toLowerCase()
    const existing = classMap.get(key)
    if (existing) {
      classMap.set(key, {
        ...existing,
        sections: [...new Set([...(existing.sections || []), ...(normalized.sections || [])])],
      })
    } else {
      classMap.set(key, normalized)
    }
  }

  const classes = Array.from(classMap.values())
  return classes.length ? { ...localData, classes } : localData
}

function classesFromStudents(students = []) {
  const classMap = new Map()
  students.forEach((student, index) => {
    const rawClass = student?.class || student?.class_name || student?.className || student?.class_level || student?.grade
    const name = String(rawClass || '').trim()
    if (!name) return
    const level = String(student?.class_level || student?.level || name || index).trim()
    const section = String(student?.section || student?.section_name || '').trim()
    const key = `${level}:${name}`.toLowerCase()
    const existing = classMap.get(key) || { level, name, active: true, sections: [] }
    if (section && !existing.sections.includes(section)) existing.sections.push(section)
    classMap.set(key, existing)
  })
  return Array.from(classMap.values())
}

export function useAcademicStore() {
  const [data, setData] = useState(DEFAULT_ACADEMIC)

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      const localData = load()
      if (!cancelled) setData(localData)

      try {
        const response = await api.get('/classes')
        const liveClasses = Array.isArray(response.data?.data) ? response.data.data : []
        if (!cancelled) setData(mergeLiveAcademic(localData, liveClasses))
      } catch {
        try {
          const response = await api.get('/students')
          const students = Array.isArray(response.data?.data) ? response.data.data : []
          if (!cancelled) setData(mergeLiveAcademic(localData, classesFromStudents(students)))
        } catch {
          if (!cancelled) setData(localData)
        }
      }
    }

    void hydrate()

    const handler = () => {
      void hydrate()
    }
    window.addEventListener('storage', handler)
    return () => {
      cancelled = true
      window.removeEventListener('storage', handler)
    }
  }, [])

  const activeClasses = data.classes.filter(c => c.active)
  const classNames = activeClasses.map(c => c.name)
  const subjectNames = data.subjects.map(s => s.name)
  const allSections = ['All', ...new Set(activeClasses.flatMap(c => c.sections || []))]

  function subjectsForClass(classIdentifier) {
    if (!classIdentifier) return subjectNames
    const targetClass = data.classes.find(c => String(c.level) === String(classIdentifier) || c.name === classIdentifier)
    const levelToSearch = targetClass ? String(targetClass.level) : String(classIdentifier)
    return data.subjects
      .filter(s => s.classes.includes(levelToSearch))
      .map(s => s.name)
  }

  function sectionsForClass(className) {
    const target = activeClasses.find(c => c.name === className)
    return target?.sections?.length ? target.sections : []
  }

  return { classes: data.classes, activeClasses, subjects: data.subjects, classNames, subjectNames, allSections, subjectsForClass, sectionsForClass }
}

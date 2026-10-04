import SavedPaperLibraryPanel from './SavedPaperLibraryPanel'
import { normalizeSavedPaperForLoad, queueSavedPaperReopen } from './savedPaperUtils'
import { useAuth } from '@/context/AuthContext'

export default function SavedPapersTab({ onLoadPaper }) {
  const { user } = useAuth()
  const teacher = String(user?.role || '').toLowerCase() === 'teacher'
  return (
    <SavedPaperLibraryPanel
      onLoadPaper={(paper) => {
        const normalized = normalizeSavedPaperForLoad(paper)
        if (normalized?.sourceTab === 'unified' || normalized?.paperSource === 'unified-paper-generator') {
          queueSavedPaperReopen(normalized.id)
        }
        onLoadPaper?.(normalized)
      }}
      sourceFilter="all"
      title={teacher ? "My Papers" : "Saved Papers"}
      subtitle={teacher ? "Only papers created by your signed-in teacher account are shown here." : "Search, reopen, or bulk print school papers."}
    />
  )
}

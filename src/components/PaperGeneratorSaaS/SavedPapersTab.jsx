import SavedPaperLibraryPanel from './SavedPaperLibraryPanel'
import { normalizeSavedPaperForLoad, queueSavedPaperReopen } from './savedPaperUtils'

export default function SavedPapersTab({ onLoadPaper }) {
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
      title="Saved Papers"
      subtitle="Search, reopen, or bulk print saved papers from Paper Studio and Unified Generator."
    />
  )
}

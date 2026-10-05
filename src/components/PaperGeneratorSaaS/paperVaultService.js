import api from '@/utils/api'

export function isPaperVaultAvailable() {
  // Authentication is HTTP-only-cookie based in Connect; localStorage tokens are not authoritative.
  return typeof window !== 'undefined'
}

export async function fetchSavedPapersFromServer() {
  if (!isPaperVaultAvailable()) return null
  const { data } = await api.get('/paper/vault')
  if (!data?.success) throw new Error(data?.message || 'Could not load saved papers')
  return Array.isArray(data.papers) ? data.papers : []
}

export async function savePaperToServer(paper) {
  if (!isPaperVaultAvailable()) return null
  const { data } = await api.post('/paper/vault', { paper })
  if (!data?.success) throw new Error(data?.message || 'Could not save paper')
  return data.paper
}

export async function renamePaperOnServer(id, name) {
  if (!isPaperVaultAvailable()) return null
  const { data } = await api.patch(`/paper/vault/${encodeURIComponent(id)}`, { name })
  if (!data?.success) throw new Error(data?.message || 'Could not rename paper')
  return data.paper
}

export async function deletePaperOnServer(id) {
  if (!isPaperVaultAvailable()) return false
  const { data } = await api.delete(`/paper/vault/${encodeURIComponent(id)}`)
  if (!data?.success) throw new Error(data?.message || 'Could not delete paper')
  return true
}

export async function notifyAdminPaperSaved(paper) {
  if (!isPaperVaultAvailable()) return null
  const classLevel = paper?.config?.classLevel
  const subjectName = paper?.config?.subject || paper?.config?.subjectName
  if (!classLevel || !subjectName) return null
  try {
    const { data } = await api.post('/paper/notify-admin', { classLevel, subjectName })
    return data?.success ? data : null
  } catch {
    return null
  }
}

export function mergeVaultPapers(localPapers = [], serverPapers = []) {
  const map = new Map()
  for (const paper of localPapers) {
    if (paper?.id) map.set(String(paper.id), { ...paper, serverSynced: false })
  }
  for (const paper of serverPapers) {
    if (!paper?.id) continue
    const key = String(paper.id)
    const local = map.get(key)
    const localTime = Date.parse(local?.updatedAt || local?.createdAt || 0)
    const serverTime = Date.parse(paper.updatedAt || paper.createdAt || 0)
    map.set(key, serverTime >= localTime ? { ...local, ...paper, serverSynced: true } : { ...paper, ...local, serverSynced: false })
  }
  return Array.from(map.values()).sort((a, b) => Date.parse(b.updatedAt || b.createdAt || 0) - Date.parse(a.updatedAt || a.createdAt || 0))
}

// V6-D strict revision API. These routes are signed-session scoped by the backend.
// The client never supplies an owner/teacher id; it only supplies its verified
// optimistic-concurrency token and the protected working-document delta model.
export async function fetchProtectedPaperForEdit(id) {
  if (!isPaperVaultAvailable()) return null
  const encoded = encodeURIComponent(id)
  const [{ data: detail }, { data: review }] = await Promise.all([
    api.get(`/portal/paper-studio/papers/${encoded}`),
    api.get(`/portal/paper-studio/papers/${encoded}/document-review`),
  ])
  if (!detail?.success || !detail?.data?.document) throw new Error(detail?.message || 'Paper could not be verified for editing.')
  if (!review?.success || !review?.review?.snapshotHash) throw new Error(review?.message || 'Paper revision token could not be verified.')
  if (String(detail.data.id) !== String(review.paperId) || Number(detail.data.revision) !== Number(review.revision)) {
    const error = new Error('Paper changed while the editor was opening. Reload My Papers and try again.')
    error.code = 'OPEN_RACE'
    throw error
  }
  return {
    ...detail.data.document,
    id: String(detail.data.id),
    revision: Number(detail.data.revision),
    serverSynced: true,
    __v6dSnapshotHash: review.review.snapshotHash,
    __v6dReviewFamily: review.review.family,
    __v6dReviewStatus: review.review.reviewStatus,
  }
}

export async function saveProtectedPaperRevision(id, { expectedRevision, expectedSnapshotHash, workingDocument }) {
  if (!isPaperVaultAvailable()) return null
  try {
    const { data } = await api.patch(`/portal/paper-studio/papers/${encodeURIComponent(id)}`, {
      expectedRevision,
      expectedSnapshotHash,
      workingDocument,
    })
    if (!data?.success || !data?.data) throw new Error(data?.message || 'Revision could not be saved.')
    return data.data
  } catch (error) {
    const payload = error?.response?.data
    if (payload?.code) error.code = payload.code
    if (payload?.message) error.message = payload.message
    throw error
  }
}

export async function fetchProtectedPaperRevisions(id) {
  if (!isPaperVaultAvailable()) return null
  const { data } = await api.get(`/portal/paper-studio/papers/${encodeURIComponent(id)}/revisions`)
  if (!data?.success || !data?.data) throw new Error(data?.message || 'Revision history could not be loaded.')
  return data.data
}

export async function fetchProtectedPaperRevision(id, revision) {
  if (!isPaperVaultAvailable()) return null
  const { data } = await api.get(`/portal/paper-studio/papers/${encodeURIComponent(id)}/revisions/${encodeURIComponent(revision)}`)
  if (!data?.success || !data?.data) throw new Error(data?.message || 'Revision snapshot could not be loaded.')
  return data.data
}

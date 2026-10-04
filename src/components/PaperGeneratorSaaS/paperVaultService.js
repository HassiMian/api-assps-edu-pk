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

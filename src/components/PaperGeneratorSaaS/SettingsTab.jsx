'use client'
import { useState, useRef } from 'react'
import { usePaperStore } from './usePaperStore'

const C = {
  bg: '#071e34',
  card: 'rgba(8,24,43,0.96)',
  cardHov: 'rgba(30,41,59,0.7)',
  gold: '#C8991A',
  goldL: '#e8b420',
  silver: '#E2E8F0',
  muted: '#94A3B8',
  border: 'rgba(148,163,184,0.18)',
  green: '#30D158',
  red: '#FF375F',
  blue: '#0A84FF',
}

const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 20,
    ...style
  }}>
    {children}
  </div>
)

const Input = ({ label, ...p }) => (
  <div style={{ marginBottom: 15 }}>
    <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
    <input {...p} style={{
      width: '100%',
      background: 'rgba(8,24,43,0.95)',
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      color: C.silver,
      padding: '10px 14px',
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box'
    }} />
  </div>
)

const ActionBtn = ({ onClick, children, color = C.blue }) => (
  <button onClick={onClick} style={{
    background: `${color}15`,
    color: color,
    border: `1px solid ${color}40`,
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }}>
    {children}
  </button>
)

export default function SettingsTab() {
  const { publishers, addPublisher, deletePublisher, questionCategories, updateQuestionCategories, paperSettings, updatePaperSettings } = usePaperStore()
  
  const [newPubName, setNewPubName] = useState('')
  const [newPubImg, setNewPubImg] = useState(null)
  const fileInputRef = useRef(null)

  const handleAddPub = () => {
    if (!newPubName.trim()) return
    addPublisher({ name: newPubName, image: newPubImg })
    setNewPubName('')
    setNewPubImg(null)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setNewPubImg(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const toggleCategory = (id) => {
    // In a real app, we might disable categories. For now, let's just allow editing marks.
  }

  const updateCategoryMarks = (id, marks) => {
    const next = questionCategories.map(c => c.id === id ? { ...c, defaultMarks: Number(marks) } : c)
    updateQuestionCategories(next)
  }

  return (
    <div style={{ padding: '10px 0', color: C.silver }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        
        {/* Publishers Management */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: C.gold }}>Publishers & Boards</h3>
            <span style={{ fontSize: 11, color: C.muted }}>Manage book publishers and logos</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <Input label="Publisher Name" placeholder="e.g. Oxford University Press" value={newPubName} onChange={e => setNewPubName(e.target.value)} />
            </div>
            <div style={{ width: 100 }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Logo</div>
              <div 
                onClick={() => fileInputRef.current.click()}
                style={{
                  height: 40, background: 'rgba(255,255,255,0.05)', border: `1px dashed ${C.border}`,
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                {newPubImg ? <img src={newPubImg} style={{ height: '100%', width: '100%', objectFit: 'cover' }} /> : 'File'}
              </div>
              <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
            </div>
            <div style={{ alignSelf: 'flex-end', marginBottom: 15 }}>
              <ActionBtn onClick={handleAddPub} color={C.green}>Add</ActionBtn>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {publishers.map(pub => (
              <div key={pub.id} style={{
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 12,
                padding: 12, textAlign: 'center', position: 'relative'
              }}>
                <button 
                  onClick={() => deletePublisher(pub.id)}
                  style={{ position: 'absolute', top: 5, right: 5, background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 14 }}
                >X</button>
                <div style={{ height: 50, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pub.image ? <img src={pub.image} style={{ height: '80%' }} /> : 'Book'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.silver }}>{pub.name}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Question Types & Marks */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: C.gold }}>Question Categories</h3>
            <span style={{ fontSize: 11, color: C.muted }}>Define exam components and default marks</span>
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 5 }}>
            {questionCategories.map(cat => (
              <div key={cat.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 8,
                border: `1px solid ${C.border}`
              }}>
                <div style={{ fontSize: 20 }}>{cat.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.silver }}>{cat.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>Type ID: {cat.id}</div>
                </div>
                <div style={{ width: 80 }}>
                  <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Def. Marks</div>
                  <input 
                    type="number" 
                    value={cat.defaultMarks} 
                    onChange={e => updateCategoryMarks(cat.id, e.target.value)}
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.2)', border: `1px solid ${C.border}`,
                      borderRadius: 6, color: C.gold, padding: '4px 8px', fontSize: 12, fontWeight: 700
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      <div style={{ marginTop: 20 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: C.gold }}>School & Principal Settings</h3>
            <span style={{ fontSize: 11, color: C.muted }}>Global identity for generated papers</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <Input label="Principal Name" value={paperSettings.principalName} onChange={e => updatePaperSettings({ principalName: e.target.value })} />
            <Input label="Principal Signature (Text)" value={paperSettings.principalSignature} onChange={e => updatePaperSettings({ principalSignature: e.target.value })} />
            <Input label="Exam Year" value={paperSettings.examYear} onChange={e => updatePaperSettings({ examYear: e.target.value })} />
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center', color: C.muted, fontSize: 12 }}>
        <p>Tip: These settings apply globally to all teachers using the Paper Generator module.</p>
      </div>
    </div>
  )
}



'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, User, FileText, LayoutTemplate, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'

type SearchResult = {
  url: string;
  type: string;
  title: string;
  subtitle: string;
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.get(`/global-search?q=${encodeURIComponent(query)}`)
        if (res.data?.success) {
          setResults(res.data.data)
          setOpen(true)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  function handleNavigate(url: string) {
    setOpen(false)
    setQuery('')
    router.push(url)
  }

  function getIcon(type: string) {
    switch (type) {
      case 'student': return <User className="w-4 h-4 text-blue-400" />
      case 'challan': return <FileText className="w-4 h-4 text-green-400" />
      case 'question': return <LayoutTemplate className="w-4 h-4 text-purple-400" />
      case 'action': return <Activity className="w-4 h-4 text-amber-400" />
      default: return <Search className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <div className="relative group hidden lg:block" ref={wrapperRef}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {loading ? (
          <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
        ) : (
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
        )}
      </div>
      <input 
        type="text" 
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true) }}
        placeholder="Search students, fees, questions..." 
        className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-64 xl:w-72 pl-10 p-2.5 placeholder-slate-400 transition-all duration-300"
      />

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[9999] py-2">
          {results.map((r, i) => (
            <div 
              key={i}
              onClick={() => handleNavigate(r.url)}
              className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex gap-3 items-start border-b border-slate-700/50 last:border-0"
            >
              <div className="mt-0.5 bg-slate-900/50 p-1.5 rounded-md">
                {getIcon(r.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">{r.title}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{r.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[9999] p-4 text-center">
          <div className="text-sm text-slate-400">No results found for "{query}"</div>
        </div>
      )}
    </div>
  )
}

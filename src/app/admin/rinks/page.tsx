'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Rink {
  id: number
  number: number
  label: string | null
  isActive: boolean
}

export default function RinksPage() {
  const [rinks, setRinks] = useState<Rink[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [number, setNumber] = useState('')
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/rinks')
      .then((r) => r.json())
      .then((d) => setRinks(d.rinks ?? []))
      .finally(() => setLoading(false))
  }, [])

  function openModal() {
    setNumber('')
    setLabel('')
    setError(null)
    setModalOpen(true)
  }

  async function handleCreate() {
    const n = parseInt(number)
    if (isNaN(n)) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/rinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: n, label: label || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong')
        return
      }
      setRinks((prev) => [...prev, data.rink].sort((a, b) => a.number - b.number))
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(rink: Rink) {
    const res = await fetch(`/api/rinks/${rink.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !rink.isActive }),
    })
    if (res.ok) {
      const data = await res.json()
      setRinks((prev) => prev.map((r) => (r.id === rink.id ? data.rink : r)))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Rinks</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure the club rinks shown on the diary</p>
        </div>
        <Button size="sm" onClick={openModal}>
          <Plus size={16} className="mr-2" />
          Add rink
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Number</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Label</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rinks.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.number}</td>
                  <td className="px-4 py-3 text-slate-600">{r.label ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.isActive ? 'default' : 'secondary'}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7"
                      onClick={() => toggleActive(r)}
                    >
                      {r.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
              {rinks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No rinks configured yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Add rink</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Rink number <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min={1}
                max={99}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 7"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Label <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Championship Rink"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={saving || !number}>
              {saving && <Loader2 size={14} className="animate-spin mr-1" />}
              Add rink
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

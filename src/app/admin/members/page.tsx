'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Loader2, Trash2, Search, ChevronLeft, ChevronRight, Printer, FileSpreadsheet } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'

interface Member {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  createdAt: number
}

const PAGE_SIZE = 10

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({})

  function validateField(field: 'name' | 'email' | 'password', value: string): string | undefined {
    if (field === 'name' && !value.trim()) return 'Name is required'
    if (field === 'email') {
      if (!value.trim()) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
    }
    if (field === 'password') {
      if (!value) return 'Password is required'
      if (value.length < 8) return 'Password must be at least 8 characters'
    }
  }

  function blurField(field: 'name' | 'email' | 'password', value: string) {
    setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
  }

  function validateAll() {
    const errs = {
      name: validateField('name', name),
      email: validateField('email', email),
      password: validateField('password', password),
    }
    setFieldErrors(errs)
    return !errs.name && !errs.email && !errs.password
  }

  useEffect(() => {
    fetch('/api/members')
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members ?? [])
        setCurrentUserId(d.currentUserId ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return members
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    )
  }, [members, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageMembers = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSearch(q: string) {
    setSearch(q)
    setPage(1)
  }

  async function handleRemove(id: string) {
    if (!confirm('Remove this member? This cannot be undone.')) return
    setRemovingId(id)
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id))
      }
    } finally {
      setRemovingId(null)
    }
  }

  function openModal() {
    setName('')
    setEmail('')
    setPassword('')
    setRole('member')
    setError(null)
    setFieldErrors({})
    setModalOpen(true)
  }

  async function handleCreate() {
    if (!validateAll()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong')
        return
      }
      setMembers((prev) => [...prev, data.member])
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  function handleExportCsv() {
    const rows = [
      ['#', 'Name', 'Email'],
      ...filtered.map((m, i) => [i + 1, m.name, m.email]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ferndown-bowls-members-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const printDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Members</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 print:hidden">Manage club member accounts</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button size="sm" variant="outline" onClick={() => window.print()} disabled={loading}>
            <Printer size={15} className="mr-1.5" />
            Print
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCsv} disabled={loading || filtered.length === 0}>
            <FileSpreadsheet size={15} className="mr-1.5" />
            Export to Excel
          </Button>
          <Button size="sm" onClick={openModal}>
            <UserPlus size={16} className="mr-1.5" />
            Add member
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-10 text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
        </div>
        {!loading && (
          <span className="text-sm text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
            {filtered.length === members.length
              ? `${members.length} member${members.length !== 1 ? 's' : ''}`
              : `${filtered.length} of ${members.length}`}
            {totalPages > 1 && ` · page ${currentPage} of ${totalPages}`}
          </span>
        )}
      </div>

      <div className="print:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Name</th>
                <th className="hidden sm:table-cell text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pageMembers.map((m, i) => (
                <tr
                  key={m.id}
                  className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}
                >
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{m.name}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-slate-600 dark:text-slate-400">{m.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={m.role === 'admin' ? 'default' : 'secondary'}>{m.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(m.id)}
                        disabled={removingId === m.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {removingId === m.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                    {search ? 'No members match your search' : 'No members yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Print-only table all filtered members, no role column */}
      {!loading && (
        <div className="hidden print:block">
          <p className="text-sm text-slate-500 mb-6">
            Printed {printDate}
            {search && ` · filtered by "${search}" (${filtered.length} result${filtered.length !== 1 ? 's' : ''})`}
          </p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800">
                <th className="text-left py-2 pr-6 font-bold text-slate-800 w-10">#</th>
                <th className="text-left py-2 pr-6 font-bold text-slate-800">Name</th>
                <th className="text-left py-2 font-bold text-slate-800">Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id} className={`border-b border-slate-200 ${i % 2 !== 0 ? 'bg-slate-50' : ''}`}>
                  <td className="py-1.5 pr-6 text-slate-400 tabular-nums">{i + 1}</td>
                  <td className="py-1.5 pr-6 font-medium text-slate-900">{m.name}</td>
                  <td className="py-1.5 text-slate-600">{m.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-slate-400">
            {filtered.length} member{filtered.length !== 1 ? 's' : ''} total
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > PAGE_SIZE && (
        <div className="print:hidden flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={15} />
            </Button>
            <span className="px-2 tabular-nums">{currentPage} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => blurField('name', e.target.value)}
                placeholder="Full name"
                className={fieldErrors.name ? 'border-red-400 focus-visible:ring-red-400' : ''}
              />
              {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => blurField('email', e.target.value)}
                placeholder="email@example.com"
                className={fieldErrors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}
              />
              {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Password <span className="text-red-500">*</span></Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => blurField('password', e.target.value)}
                placeholder="Min. 8 characters"
                className={fieldErrors.password ? 'border-red-400 focus-visible:ring-red-400' : ''}
              />
              {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'member')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin mr-1" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

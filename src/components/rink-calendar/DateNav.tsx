'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  date: string
}

export function DateNav({ date }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const parsed = parseISO(date)
  const prev = format(subDays(parsed, 1), 'yyyy-MM-dd')
  const next = format(addDays(parsed, 1), 'yyyy-MM-dd')
  const displayDate = format(parsed, 'EEEE do MMMM yyyy')
  const displayDateShort = format(parsed, 'EEE do MMM yyyy')

  function handleSelect(d: Date | undefined) {
    if (!d) return
    setOpen(false)
    router.push(`/calendar/${format(d, 'yyyy-MM-dd')}`)
  }

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <Button
        variant="outline"
        className="h-12 sm:h-9 px-3"
        onClick={() => router.push(`/calendar/${prev}`)}
      >
        <ChevronLeft size={20} />
        <span className="hidden sm:inline ml-1">Previous</span>
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none sm:min-w-[220px] h-12 sm:h-9 text-base sm:text-sm font-semibold dark:text-slate-200"
          >
            <CalendarIcon size={18} className="mr-2 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">{displayDate}</span>
            <span className="sm:hidden">{displayDateShort}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={parsed}
            onSelect={handleSelect}
            autoFocus
            className="[--cell-size:3rem] sm:[--cell-size:2rem]"
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        className="h-12 sm:h-9 px-3"
        onClick={() => router.push(`/calendar/${next}`)}
      >
        <span className="hidden sm:inline mr-1">Next</span>
        <ChevronRight size={20} />
      </Button>
    </div>
  )
}

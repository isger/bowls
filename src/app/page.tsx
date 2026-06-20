import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default function Home() {
  redirect(`/calendar/${format(new Date(), 'yyyy-MM-dd')}`)
}

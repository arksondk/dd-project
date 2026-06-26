import { setStreamers, useStreamsStore } from '@/domain/streams/store'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export const SEARCH_PARAMS_KEY = 'streamers'

const StreamStoreInitializer: React.FC = () => {
  const streamers = useStreamsStore(s => s.streamers)
  const streamParams = useSearchParams().get(SEARCH_PARAMS_KEY)
  const { push, replace } = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!streamParams) return
    const uniqueStreamersFromParams = Array.from(
      new Set(streamParams.split(',').filter(Boolean)),
    )
    setStreamers(uniqueStreamersFromParams)
    if (uniqueStreamersFromParams.length) return
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.delete(SEARCH_PARAMS_KEY)
    replace(`/?${searchParams.toString()}`, { scroll: true })
  }, [streamParams, replace])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!streamers.length) return
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set(SEARCH_PARAMS_KEY, streamers.join(','))
    push(`/?${searchParams.toString()}`, { scroll: false })
  }, [streamers, push])

  return null
}

export default StreamStoreInitializer

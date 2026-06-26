'use client'

import { useState } from 'react'
import { Container } from '@mui/material'
import ControlPanel from '@/components/ControlPanel'
import StreamGrid from '@/components/StreamGrid'
import { useStreamsStore, setStreamers } from '@/domain/streams/store'
// import { useSearchParams } from 'next/navigation'

export interface InputItem {
  id: string
  value: string
}

export default function Home() {
  // const streamParams = useSearchParams().get('streamers')
  const streamers = useStreamsStore(state => state.streamers)
  const [inputs, setInputs] = useState<InputItem[]>(() => {
    // if (streamParams) {
    //   const uniqueStreamersFromParams = Array.from(
    //     new Set(streamParams.split(',').filter(Boolean)),
    //   )
    //   if (uniqueStreamersFromParams.length) {
    //     return uniqueStreamersFromParams.map(streamer => ({
    //       id: `input-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    //       value: streamer,
    //     }))
    //   }
    // }

    return [
      {
        id: `input-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        value: '',
      },
    ]
  })
  const [errorIndices, setErrorIndices] = useState<number[]>([])

  const handleSyncDelete = (indexToRemove: number) => {
    const nextInputs = inputs.filter((_, index) => index !== indexToRemove)

    if (nextInputs.length === 0) {
      setInputs([
        {
          id: `input-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          value: '',
        },
      ])
    } else {
      setInputs(nextInputs)
    }

    setErrorIndices(prev =>
      prev
        .filter(i => i !== indexToRemove)
        .map(i => (i > indexToRemove ? i - 1 : i)),
    )

    const nextStreamers = streamers.filter(
      (_, index) => index !== indexToRemove,
    )
    setStreamers(nextStreamers)
  }

  return (
    <Container maxWidth='xl' sx={{ marginTop: 4, marginBottom: 4 }}>
      <ControlPanel
        inputs={inputs}
        setInputs={setInputs}
        errorIndices={errorIndices}
        setErrorIndices={setErrorIndices}
        onSyncDelete={handleSyncDelete}
      />

      <StreamGrid onSyncDelete={handleSyncDelete} />
    </Container>
  )
}

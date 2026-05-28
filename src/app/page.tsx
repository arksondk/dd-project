'use client'

import { useState } from 'react'
import { Container } from '@mui/material'
import ControlPanel from '@/components/ControlPanel'
import StreamGrid from '@/components/StreamGrid'
import { useStreamsStore, setStreamers } from '@/domain/streams/store'

export interface InputItem {
  id: string
  value: string
}

export default function Home() {
  const [inputs, setInputs] = useState<InputItem[]>([
    { id: `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, value: '' }
  ])
  const [errorIndices, setErrorIndices] = useState<number[]>([])

  const streamers = useStreamsStore(state => state.streamers)

  const handleSyncDelete = (indexToRemove: number) => {
    const nextInputs = inputs.filter((_, index) => index !== indexToRemove)
    
    if (nextInputs.length === 0) {
      setInputs([
        { id: `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, value: '' }
      ])
    } else {
      setInputs(nextInputs)
    }

    setErrorIndices(prev =>
      prev
        .filter(i => i !== indexToRemove)
        .map(i => (i > indexToRemove ? i - 1 : i)),
    )

    const nextStreamers = streamers.filter((_, index) => index !== indexToRemove)
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
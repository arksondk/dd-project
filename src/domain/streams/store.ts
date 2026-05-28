import { create } from 'zustand'
import { StreamerId } from './schema'

type StreamsStore = {
  streamers: StreamerId[]
}

const initialState: StreamsStore = {
  streamers: [],
}

export const useStreamsStore = create<StreamsStore>(() => ({
  ...initialState,
}))

export const setStreamers = (newStreamers: StreamerId[]) => {
  useStreamsStore.setState({ streamers: newStreamers })
}

export const addStreamer = (newStreamer: StreamerId) => {
  useStreamsStore.setState(prev => ({
    streamers: [...prev.streamers, newStreamer],
  }))
}

export const removeStreamer = (streamerId: StreamerId) => {
  useStreamsStore.setState(prev => ({
    streamers: prev.streamers.filter(id => id !== streamerId),
  }))
}

export const clearStreamers = () => {
  useStreamsStore.setState({ streamers: [] })
}
'use client'

// import StreamStoreInitializer from '@/components/StreamStoreInitializer'
import { Suspense } from 'react'

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* <StreamStoreInitializer /> */}
      {children}
    </Suspense>
  )
}

export default RootLayout

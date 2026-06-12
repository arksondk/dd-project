'use client'

import { memo } from 'react'

const MemoedPlayer: React.FC<{ channelId: string }> = memo(({ channelId }) => (
  // @ts-expect-error 自製 Twitch Web Component，尚未有 TypeScript 定義
  <twitch-video
    controls
    src={`https://www.twitch.tv/${channelId}`}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    }}
  />
))

MemoedPlayer.displayName = 'MemoedPlayer'

export default MemoedPlayer

'use client'

import { Box, IconButton, Grid } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useStreamsStore } from '@/domain/streams/store'

interface StreamGridProps {
  onSyncDelete: (index: number) => void
}

export default function StreamGrid({ onSyncDelete }: StreamGridProps) {
  const streamers = useStreamsStore(state => state.streamers)

  if (streamers.length === 0) return null

  return (
    <Grid container spacing={3}>
      {streamers.map((channelId, index) => (
        <Grid size={{ xs: 12, sm: 6 }} key={`stream-node-${channelId}-${index}`}>
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%', // 保持 16:9 比例
              bgcolor: 'black',
              borderRadius: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }}
          >
            {/* 右上角關閉按鈕 */}
            <IconButton
              onClick={() => onSyncDelete(index)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 10,
                bgcolor: '#ff4444',
                color: 'white',
                padding: '4px',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: '#cc0000',
                  transform: 'scale(1.15)',
                },
              }}
              size='small'
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>

            {/* 影片容器 */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <iframe
                src={`https://player.twitch.tv/?channel=${channelId}&parent=localhost&autoplay=true&muted=true`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '4px',
                }}
                allowFullScreen
              />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}
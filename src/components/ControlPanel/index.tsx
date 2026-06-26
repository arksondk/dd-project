'use client'

import { useState } from 'react'
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Grid,
  Alert,
  Collapse,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { setStreamers, clearStreamers } from '@/domain/streams/store'
import { InputItem } from '@/app/(main)/page'

interface ControlPanelProps {
  inputs: InputItem[]
  setInputs: React.Dispatch<React.SetStateAction<InputItem[]>>
  errorIndices: number[]
  setErrorIndices: React.Dispatch<React.SetStateAction<number[]>>
  onSyncDelete: (index: number) => void
}

export default function ControlPanel({
  inputs,
  setInputs,
  errorIndices,
  setErrorIndices,
  onSyncDelete,
}: ControlPanelProps) {
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const handleInputChange = (index: number, value: string) => {
    const nextInputs = [...inputs]
    nextInputs[index].value = value
    setInputs(nextInputs)

    if (errorIndices.includes(index)) {
      setErrorIndices(errorIndices.filter(i => i !== index))
    }
    if (errorIndices.length <= 1) {
      setAlertMessage(null)
    }
  }

  // ✨ 修正：增加欄位時加入防呆，超過 4 個就不再增加
  const handleAddField = () => {
    if (inputs.length >= 4) return

    const uniqueId = `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setInputs([...inputs, { id: uniqueId, value: '' }])
  }

  const handleRemoveField = (indexToRemove: number) => {
    onSyncDelete(indexToRemove)
  }

  const validateAndGetTwitchId = (
    input: string,
  ): { id: string | null; isValid: boolean } => {
    const trimmed = input.trim()
    if (!trimmed) return { id: null, isValid: true }

    if (
      trimmed.includes('http://') ||
      trimmed.includes('https://') ||
      trimmed.includes('.')
    ) {
      try {
        const urlObj = new URL(
          trimmed.includes('http') ? trimmed : `https://${trimmed}`,
        )
        if (!urlObj.hostname.includes('twitch.tv'))
          return { id: null, isValid: false }
        const path = urlObj.pathname.split('/').filter(Boolean)
        const channelId = path[0]
        const twitchIdRegex = /^[a-zA-Z0-9_]{4,25}$/
        if (channelId && twitchIdRegex.test(channelId))
          return { id: channelId, isValid: true }
        return { id: null, isValid: false }
      } catch {
        return { id: null, isValid: false }
      }
    } else {
      const twitchIdRegex = /^[a-zA-Z0-9_]{4,25}$/
      if (twitchIdRegex.test(trimmed)) return { id: trimmed, isValid: true }
      return { id: null, isValid: false }
    }
  }

  const handleGenerateStreams = (e: React.FormEvent) => {
    e.preventDefault()
    const validChannels: string[] = []
    const newErrorIndices: number[] = []

    inputs.forEach((item, index) => {
      const { id, isValid } = validateAndGetTwitchId(item.value)
      if (!isValid) newErrorIndices.push(index)
      else if (id) validChannels.push(id)
    })

    if (newErrorIndices.length > 0) {
      setErrorIndices(newErrorIndices)
      setAlertMessage(
        '偵測到不合法的輸入！請確認是否皆為 Twitch 網址或正確的頻道 ID。',
      )
      return
    }

    // 確認 validChannels 中的頻道 ID 沒有重複
    const uniqueChannels = new Set(validChannels)
    if (uniqueChannels.size !== validChannels.length) {
      setAlertMessage('頻道 ID 中有重複項目，請確保每個頻道都是唯一的。')
      return
    }

    setAlertMessage(null)
    setErrorIndices([])
    setStreamers(validChannels)
  }

  const handleClearAll = () => {
    setInputs([
      {
        id: `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        value: '',
      },
    ])
    setErrorIndices([])
    setAlertMessage(null)
    clearStreamers()
  }

  return (
    <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
      <Typography
        variant='h4'
        component='h1'
        gutterBottom
        sx={{ fontWeight: 'bold' }}
      >
        Multi Twitch Stream Viewer
      </Typography>
      <Typography
        variant='body2'
        color='textSecondary'
        sx={{ marginBottom: 3 }}
      >
        請在下方輸入 Twitch 頻道網址或 ID。若輸入非 Twitch 網址（如
        YouTube），系統將會攔截並提示。
      </Typography>

      <Collapse in={Boolean(alertMessage)} sx={{ marginBottom: 3 }}>
        <Alert severity='error' onClose={() => setAlertMessage(null)}>
          {alertMessage}
        </Alert>
      </Collapse>

      <Box component='form' onSubmit={handleGenerateStreams}>
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {inputs.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  size='small'
                  variant='outlined'
                  error={errorIndices.includes(index)}
                  helperText={
                    errorIndices.includes(index) ? '非特意之 Twitch 格式' : ''
                  }
                  label={`頻道 #${index + 1}`}
                  placeholder='例如: sennna_aki 或 Twitch 網址'
                  value={item.value}
                  onChange={e => handleInputChange(index, e.target.value)}
                />
                <IconButton
                  color='error'
                  onClick={() => handleRemoveField(index)}
                  disabled={inputs.length === 1 && !inputs[0].value}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* ✨ 修正：當 inputs.length >= 4 時，按鈕自動進入 disabled 狀態，並附帶提示文字 */}
          <Button
            variant='outlined'
            startIcon={<AddIcon />}
            onClick={handleAddField}
            disabled={inputs.length >= 4}
          >
            {inputs.length >= 4 ? '已達 4 個頻道上限' : '增加頻道欄位'}
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant='outlined' color='inherit' onClick={handleClearAll}>
              全部清空
            </Button>
            <Button
              variant='contained'
              color='secondary'
              type='submit'
              sx={{ px: 4 }}
              disabled={
                inputs.every(item => !item.value) || errorIndices.length > 0
              }
            >
              生成實況牆
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

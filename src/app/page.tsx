"use client";

import { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, IconButton, Grid, Alert, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// 引入你的 Zustand Store
import { useStreamsStore, setStreamers } from '@/domain/streams/store'; 

export default function Home() {
  // 動態輸入框狀態
  const [inputs, setInputs] = useState<string[]>(['']);
  
  // 【新增狀態】用來記錄哪些欄位輸入錯誤（儲存有錯誤的 index）
  const [errorIndices, setErrorIndices] = useState<number[]>([]);
  // 【新增狀態】控制提示訊息的顯示與內容
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // 從全域 Zustand Store 讀取實況主名單
  const streamers = useStreamsStore((state) => state.streamers);

  // 處理個別輸入框文字改變
  const handleInputChange = (index: number, value: string) => {
    const nextInputs = [...inputs];
    nextInputs[index] = value;
    setInputs(nextInputs);

    // 當使用者重新輸入時，自動移除該欄位的錯誤紅框
    if (errorIndices.includes(index)) {
      setErrorIndices(errorIndices.filter(i => i !== index));
    }
    if (errorIndices.length <= 1) {
      setAlertMessage(null); // 如果沒錯誤了，關閉提示
    }
  };

  // 動態增加一個 URL 輸入框
  const handleAddField = () => {
    setInputs([...inputs, '']);
  };

  // 動態移除某一個 URL 輸入框
  const handleRemoveField = (indexToRemove: number) => {
    if (inputs.length === 1) {
      setInputs(['']);
      setErrorIndices([]);
      setAlertMessage(null);
      return;
    }
    setInputs(inputs.filter((_, index) => index !== indexToRemove));
    // 同步更新錯誤索引的位置
    setErrorIndices(prev => 
      prev.filter(i => i !== indexToRemove).map(i => i > indexToRemove ? i - 1 : i)
    );
  };

  // 【核心修改】精準驗證是否為合法的 Twitch 網址或 ID
  const validateAndGetTwitchId = (input: string): { id: string | null; isValid: boolean } => {
    const trimmed = input.trim();
    if (!trimmed) return { id: null, isValid: true }; // 空白欄位不當作錯誤，直接忽略

    // 檢查是否為網址
    if (trimmed.includes('http://') || trimmed.includes('https://') || trimmed.includes('.')) {
      try {
        const urlObj = new URL(trimmed.includes('http') ? trimmed : `https://${trimmed}`);
        
        // 嚴格檢查：域名必須包含 twitch.tv
        if (!urlObj.hostname.includes('twitch.tv')) {
          return { id: null, isValid: false };
        }
        
        const path = urlObj.pathname.split('/').filter(Boolean);
        const channelId = path[0];
        
        // Twitch 帳號正規表示式：4到25個字元，只能是英文、數字、底線
        const twitchIdRegex = /^[a-zA-Z0-9_]{4,25}$/;
        if (channelId && twitchIdRegex.test(channelId)) {
          return { id: channelId, isValid: true };
        }
        return { id: null, isValid: false };
      } catch (e) {
        return { id: null, isValid: false };
      }
    } else {
      // 如果不是網址，檢查是不是純 Twitch ID 格式
      const twitchIdRegex = /^[a-zA-Z0-9_]{4,25}$/;
      if (twitchIdRegex.test(trimmed)) {
        return { id: trimmed, isValid: true };
      }
      return { id: null, isValid: false };
    }
  };

  // 按下「生成實況牆」
  const handleGenerateStreams = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validChannels: string[] = [];
    const newErrorIndices: number[] = [];

    inputs.forEach((input, index) => {
      const { id, isValid } = validateAndGetTwitchId(input);
      
      if (!isValid) {
        newErrorIndices.push(index);
      } else if (id) {
        validChannels.push(id);
      }
    });

    // 如果有任何一欄填錯了（例如貼到 YouTube 或程式碼）
    if (newErrorIndices.length > 0) {
      setErrorIndices(newErrorIndices);
      setAlertMessage("偵測到不合法的輸入！請確認是否皆為 Twitch 網址或正確的頻道 ID (不支援 YouTube 等其他網站)。");
      return; // 🛑 攔截！不生出任何影片框框
    }

    // 檢查通過，正常生成
    setAlertMessage(null);
    setErrorIndices([]);
    if (validChannels.length > 0) {
      setStreamers(validChannels); 
    }
  };

  const handleRemoveStreamByIndex = (indexToRemove: number) => {
    const nextStreamers = streamers.filter((_, index) => index !== indexToRemove);
    setStreamers(nextStreamers);
  };

  const handleClearAll = () => {
    setInputs(['']);
    setErrorIndices([]);
    setAlertMessage(null);
    setStreamers([]);
  };

  return (
    <Container maxWidth="xl" sx={{ marginTop: 4, marginBottom: 4 }}>
      
      {/* 上方控制列 */}
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom sx={{ fontWeight: 'bold' }}>
          Multi Twitch Stream Viewer
        </Typography>
        <Typography variant='body2' color="textSecondary" sx={{ marginBottom: 3 }}>
          請在下方輸入 Twitch 頻道網址或 ID。若輸入非 Twitch 網址（如 YouTube），系統將會攔截並提示。
        </Typography>

        {/* 【新提示 UI】錯誤警告標籤 */}
        <Collapse in={Boolean(alertMessage)} sx={{ marginBottom: 3 }}>
          <Alert severity="error" onClose={() => setAlertMessage(null)}>
            {alertMessage}
          </Alert>
        </Collapse>
        
        <Box component="form" onSubmit={handleGenerateStreams}>
          
          {/* 輸入框網格 */}
          <Grid container spacing={2} sx={{ marginBottom: 3 }}>
            {inputs.map((value, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    // 【動態錯誤特效】如果這個 index 填錯，框框會變紅並顯示提示文字
                    error={errorIndices.includes(index)}
                    helperText={errorIndices.includes(index) ? "非特意之 Twitch 格式" : ""}
                    label={`頻道 #${index + 1}`}
                    placeholder="例如: sennna_aki 或 Twitch 網址"
                    value={value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveField(index)}
                    disabled={inputs.length === 1 && !inputs[0]}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* 按鈕操作區 */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={handleAddField}
            >
              增加頻道欄位
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" color="inherit" onClick={handleClearAll}>
                全部清空
              </Button>
              <Button variant="contained" color="secondary" type="submit" sx={{ px: 4 }}>
                生成實況牆
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* 下方影片網格牆 */}
      <Grid container spacing={3}>
        {streamers.map((channelId, index) => (
          <Grid size={{ xs: 12, sm: 6 }} key={`${channelId}-${index}`}>
            <Box sx={{ 
              position: 'relative', 
              paddingTop: '56.25%', 
              bgcolor: 'black', 
              borderRadius: 1, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              
              <IconButton
                onClick={() => handleRemoveStreamByIndex(index)}
                sx={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  zIndex: 10,
                  bgcolor: '#ff4444',
                  color: 'white',
                  padding: '4px',
                  boxShadow: 2,
                  '&:hover': { 
                    bgcolor: '#cc0000', 
                    transform: 'scale(1.15)' 
                  },
                }}
                size="small"
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>

              <iframe
                src={`https://player.twitch.tv/?channel=${channelId}&parent=localhost&autoplay=true`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '4px'
                }}
                allowFullScreen
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
"use client";

import { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, IconButton, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// 引入你的 Zustand Store
import { useStreamsStore, setStreamers } from '@/domain/streams/store'; 

export default function Home() {
  // 1. 動態輸入框狀態：預設只有一個空欄位，點擊按鈕可以自由增減
  const [inputs, setInputs] = useState<string[]>(['']);

  // 從全域 Zustand Store 讀取實況主名單
  const streamers = useStreamsStore((state) => state.streamers);

  // 處理個別輸入框文字改變
  const handleInputChange = (index: number, value: string) => {
    const nextInputs = [...inputs];
    nextInputs[index] = value;
    setInputs(nextInputs);
  };

  // 【新增功能】動態增加一個 URL 輸入框
  const handleAddField = () => {
    setInputs([...inputs, '']);
  };

  // 【新增功能】動態移除某一個 URL 輸入框
  const handleRemoveField = (indexToRemove: number) => {
    // 如果只剩一欄，就清空它而不刪除欄位
    if (inputs.length === 1) {
      setInputs(['']);
      return;
    }
    setInputs(inputs.filter((_, index) => index !== indexToRemove));
  };

  // 輔助函式：從輸入中解析出 Twitch ID
  const getChannelName = (input: string) => {
    if (!input.trim()) return null;
    try {
      const urlObj = new URL(input.includes('http') ? input : `https://${input}`);
      const path = urlObj.pathname.split('/').filter(Boolean);
      return path[0]; 
    } catch (e) {
      return input.trim(); 
    }
  };

  // 按下「生成實況牆」
  const handleGenerateStreams = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validChannels: string[] = [];
    inputs.forEach(input => {
      const channelId = getChannelName(input);
      if (channelId) {
        validChannels.push(channelId);
      }
    });

    if (validChannels.length > 0) {
      setStreamers(validChannels); 
    }
  };

  // 精準刪除影片：改用 index 來過濾 Zustand 陣列，解決同名實況主一起被刪除的問題
  const handleRemoveStreamByIndex = (indexToRemove: number) => {
    const nextStreamers = streamers.filter((_, index) => index !== indexToRemove);
    setStreamers(nextStreamers);
  };

  const handleClearAll = () => {
    setInputs(['']);
    setStreamers([]);
  };

  return (
    <Container maxWidth="xl" sx={{ marginTop: 4, marginBottom: 4 }}>
      
      {/* 上方控制列：白底卡片視覺 */}
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom sx={{ fontWeight: 'bold' }}>
          Multi Twitch Stream Viewer
        </Typography>
        <Typography variant='body2' color="textSecondary" sx={{ marginBottom: 3 }}>
          請在下方輸入 Twitch 頻道網址或 ID，您可以點擊「增加頻道」來管理多個輸入框。
        </Typography>
        
        <Box component="form" onSubmit={handleGenerateStreams}>
          
          {/* 修正後的 MUI v6 Grid 排版：Grid container 直接包裹 Grid size */}
          <Grid container spacing={2} sx={{ marginBottom: 3 }}>
            {inputs.map((value, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label={`頻道 #${index + 1}`}
                    placeholder="例如: sennna_aki"
                    value={value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                  {/* 輸入框旁邊的刪除垃圾桶 */}
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveField(index)}
                    disabled={inputs.length === 1 && !inputs[0]} // 只有一欄且為空時禁用
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* 按鈕操作區 */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            {/* 左側：增加欄位按鈕 */}
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={handleAddField}
            >
              增加頻道欄位
            </Button>

            {/* 右側：清空與提交 */}
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
              paddingTop: '56.25%', // 16:9
              bgcolor: 'black', 
              borderRadius: 1, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              
              {/* 改用 handleRemoveStreamByIndex(index)，點哪台就關哪台 */}
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
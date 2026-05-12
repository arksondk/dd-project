"use client"; // 步驟 1: 宣告為 Client Component

import { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box } from '@mui/material';

export default function Home() {
  // 步驟 2: 定義狀態
  const [url, setUrl] = useState('');
  const [streams, setStreams] = useState<string[]>([]);

  const handleAddStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      setStreams([...streams, url]);
      setUrl(''); // 清空輸入框
    }
  };

  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Multi Twitch Stream Viewer
        </Typography>
        <Typography variant='body1' sx={{ marginBottom: 3 }}>
          A web application that allows users to watch multiple Twitch streams
          simultaneously.
        </Typography>

        {/* 步驟 3: 加入輸入區域 */}
        <Box 
          component="form" 
          onSubmit={handleAddStream} 
          sx={{ display: 'flex', gap: 2, marginBottom: 4 }}
        >
          <TextField
            fullWidth
            variant="outlined"
            label="輸入 Twitch 頻道網址"
            placeholder="https://www.twitch.tv/shroud"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button 
            variant="contained" 
            color="secondary" 
            type="submit"
            sx={{ whiteSpace: 'nowrap', px: 4 }}
          >
            新增串流
          </Button>
        </Box>

        {/* 步驟 4: 預留顯示串流的區塊 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {streams.map((s, index) => (
            <Paper key={index} sx={{ aspectRatio: '16/9', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
              <Typography color="text.secondary">{s}</Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Container>
  );
}
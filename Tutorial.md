# Multi Twitch Stream Viewer 專案架構教學

本專案是一個基於 Next.js 16、React 19 和 MUI 的多 Twitch 直播檢視器應用程式。這份教學將幫助你了解專案架構並指導你如何繼續開發。

## 📁 專案結構概覽

```
src/
├── app/              # Next.js App Router 路由系統
├── components/       # 可重用元件
├── domain/          # 業務邏輯與資料管理
└── style/           # 樣式相關設定
```

## 🛠 技術堆疊

- **React**: 19.2.4
- **Next.js**: 16.2.4 (使用 App Router)
- **UI Framework**: Material-UI (MUI) v9
- **狀態管理**: Zustand 5.0.12
- **樣式**: MUI + Emotion
- **語言**: TypeScript 5

## 📂 詳細架構說明

### 1. `/app` - Next.js App Router

這是 Next.js 16 的新路由系統，所有頁面和路由都在這裡定義。

#### 重要檔案：

- **`layout.tsx`**: 應用程式的根佈局
  - 設定 MUI ThemeProvider 和 CssBaseline
  - 配置 Roboto 字體
  - 多語言支援 (zh-Hant-TW)

- **`page.tsx`**: 首頁元件
  - 使用 MUI Container 和 Paper 元件
  - 展示基本的歡迎訊息

#### 如何新增路由：

```bash
# 新增 /streams 頁面
mkdir src/app/streams
touch src/app/streams/page.tsx

# 新增動態路由 /streams/[id]
mkdir src/app/streams/[id]
touch src/app/streams/[id]/page.tsx
```

### 2. `/components` - 可重用元件

存放所有可重用的 UI 元件，採用模組化結構。

#### 現有元件：

- **`NextLink/`**: Next.js Link 元件的封裝
  - `NextLink.tsx`: 主要元件檔案
  - `index.ts`: 匯出檔案

#### 建議的元件組織方式：

```
components/
├── StreamPlayer/           # 直播播放器元件
│   ├── index.ts
│   ├── StreamPlayer.tsx
│   └── StreamPlayer.types.ts
├── StreamGrid/            # 多直播網格佈局
│   ├── index.ts
│   ├── StreamGrid.tsx
│   └── StreamGrid.types.ts
└── UI/                    # 基礎 UI 元件
    ├── Button/
    ├── Modal/
    └── Input/
```

### 3. `/domain` - 業務邏輯層

這是專案的核心業務邏輯層，按功能模組化組織。

#### 現有模組：

**`streams/` 模組**:

- **`schema.ts`**: 型別定義

  ```typescript
  export type StreamerId = string
  ```

- **`store.ts`**: Zustand 狀態管理
  - `useStreamsStore`: 主要狀態 store
  - `setStreamers`: 設定直播主清單
  - `addStreamer`: 新增直播主
  - `removeStreamer`: 移除直播主

#### 建議的 domain 結構擴展：

```
domain/
├── streams/
│   ├── schema.ts          # 型別定義
│   ├── store.ts           # 狀態管理
│   ├── api.ts             # API 呼叫
│   ├── hooks.ts           # 自定義 hooks
│   └── utils.ts           # 工具函數
├── auth/                  # 使用者認證
│   ├── schema.ts
│   ├── store.ts
│   └── api.ts
└── settings/              # 應用設定
    ├── schema.ts
    └── store.ts
```

### 4. `/style` - 樣式設定

#### 現有設定：

- **`theme.ts`**: MUI 主題設定
  - 啟用 CSS 變數
  - 設定 Roboto 字體系列

#### 建議擴展：

```typescript
const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#9146ff', // Twitch 紫色
    },
    secondary: {
      main: '#00f5ff',
    },
  },
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
})
```

## 🚀 開發指南

### 1. 啟動開發環境

```bash
npm run dev
```

### 2. 新增功能的建議流程

#### Step 1: 定義資料結構

在 `domain/streams/schema.ts` 中新增型別定義：

```typescript
export type Stream = {
  id: StreamerId
  username: string
  title: string
  viewerCount: number
  thumbnailUrl: string
  isLive: boolean
}

export type StreamSettings = {
  volume: number
  quality: 'auto' | '1080p' | '720p' | '480p'
}
```

#### Step 2: 建立 API 呼叫

建立 `domain/streams/api.ts`：

```typescript
import axios from 'axios'
import type { Stream } from './schema'

const api = axios.create({
  baseURL: 'https://api.twitch.tv/helix',
  headers: {
    'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TWITCH_ACCESS_TOKEN}`,
  },
})

export const getStreamInfo = async (
  username: string,
): Promise<Stream | null> => {
  try {
    const response = await api.get(`/streams?user_login=${username}`)
    // 處理 API 回應...
    return response.data
  } catch (error) {
    console.error('Failed to fetch stream info:', error)
    return null
  }
}
```

#### Step 3: 建立自定義 hooks

建立 `domain/streams/hooks.ts`：

```typescript
import useSWR from 'swr'
import { getStreamInfo } from './api'
import type { Stream } from './schema'

export const useStreamInfo = (username: string) => {
  return useSWR<Stream | null>(
    username ? `/streams/${username}` : null,
    () => getStreamInfo(username),
    {
      refreshInterval: 30000, // 每30秒更新
      revalidateOnFocus: false,
    },
  )
}
```

#### Step 4: 建立 UI 元件

建立 `components/StreamPlayer/StreamPlayer.tsx`：

```typescript
'use client'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { useStreamInfo } from '@/domain/streams/hooks'

interface StreamPlayerProps {
  username: string
}

export default function StreamPlayer({ username }: StreamPlayerProps) {
  const { data: stream, error, isLoading } = useStreamInfo(username)

  if (isLoading) return <div>載入中...</div>
  if (error) return <div>載入失敗</div>
  if (!stream?.isLive) return <div>此直播目前離線</div>

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{stream.username}</Typography>
        <Typography variant="body2">{stream.title}</Typography>
        {/* Twitch 嵌入式播放器 */}
        <Box
          component="iframe"
          src={`https://player.twitch.tv/?channel=${username}&parent=${window.location.hostname}`}
          sx={{ width: '100%', height: 300 }}
        />
      </CardContent>
    </Card>
  )
}
```

#### Step 5: 整合到頁面

更新 `app/page.tsx` 或建立新頁面來使用元件。

### 3. 狀態管理最佳實踐

使用 Zustand 時的建議模式：

```typescript
// domain/streams/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type StreamsStore = {
  // 狀態
  streamers: StreamerId[]
  layout: 'grid' | 'list'

  // 動作
  addStreamer: (id: StreamerId) => void
  removeStreamer: (id: StreamerId) => void
  setLayout: (layout: 'grid' | 'list') => void
}

export const useStreamsStore = create<StreamsStore>()(
  persist(
    (set, get) => ({
      // 初始狀態
      streamers: [],
      layout: 'grid',

      // 動作實現
      addStreamer: id =>
        set(state => ({
          streamers: [...state.streamers, id],
        })),

      removeStreamer: id =>
        set(state => ({
          streamers: state.streamers.filter(s => s !== id),
        })),

      setLayout: layout => set({ layout }),
    }),
    {
      name: 'streams-storage', // 本地儲存鍵名
    },
  ),
)
```

## 📋 下一步建議

1. **設定環境變數**: 建立 `.env.local` 檔案設定 Twitch API 金鑰
2. **安裝額外套件**: 根據需要安裝 `axios`, `swr`, `zustand/middleware`
3. **建立 API 整合**: 整合 Twitch API 來獲取直播資訊
4. **開發核心功能**:
   - 直播搜尋功能
   - 多視窗直播檢視
   - 直播設定 (音量、畫質)
   - 我的最愛直播主
5. **優化使用體驗**: 加入載入狀態、錯誤處理、響應式設計

## 🔧 常用指令

```bash
# 開發
npm run dev

# 建置
npm run build

# 啟動正式環境
npm run start

# ESLint 檢查
npm run lint
```

這個架構為你提供了一個堅實的基礎，你可以根據專案需求逐步擴展功能。記住保持模組化和關注點分離的原則，這樣程式碼會更容易維護和擴展。

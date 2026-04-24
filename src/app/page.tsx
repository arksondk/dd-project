import { Container, Paper, Typography } from '@mui/material'

export default function Home() {
  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Multi Twitch Stream Viewer
        </Typography>
        <Typography variant='body1'>
          A web application that allows users to watch multiple Twitch streams
          simultaneously.
        </Typography>
      </Paper>
    </Container>
  )
}

import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import TaskManager from './components/TaskManager';
import MobileTaskManager from './components/mobile/MobileTaskManager';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ width: '100%' }}>
      {isMobile ? <MobileTaskManager /> : <TaskManager />}
    </Box>
  );
}

export default App; 
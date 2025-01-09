import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';

interface TimerButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

const TimerButton: React.FC<TimerButtonProps> = ({ isRecording, onClick }) => {
  return (
    <Tooltip title={isRecording ? "暂停" : "开始计时"}>
      <IconButton 
        onClick={onClick}
        size="small"
        sx={{ 
          color: '#f44336',
          '&:hover': {
            bgcolor: 'rgba(244, 67, 54, 0.1)'
          }
        }}
      >
        {isRecording ? <PauseCircleFilledIcon /> : <FiberManualRecordIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default TimerButton; 
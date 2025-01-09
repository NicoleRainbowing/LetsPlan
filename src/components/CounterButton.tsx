import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface CounterButtonProps {
  onClick: () => void;
}

const CounterButton: React.FC<CounterButtonProps> = ({ onClick }) => {
  return (
    <Tooltip title="增加执行次数">
      <IconButton 
        onClick={onClick}
        size="small"
        sx={{ 
          color: '#2196f3',
          '&:hover': {
            bgcolor: 'rgba(33, 150, 243, 0.1)'
          }
        }}
      >
        <AddCircleOutlineIcon />
      </IconButton>
    </Tooltip>
  );
};

export default CounterButton; 
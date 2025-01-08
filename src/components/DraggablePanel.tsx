import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Box } from '@mui/material';

interface DraggablePanelProps {
  id: string;
  index: number;
  width?: string;
  children: React.ReactNode;
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({ 
  id, 
  index, 
  width = '33.33%',
  children 
}) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            width,
            opacity: snapshot.isDragging ? 0.5 : 1,
            cursor: 'move',
          }}
        >
          {children}
        </Box>
      )}
    </Draggable>
  );
};

export default DraggablePanel; 
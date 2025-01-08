import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import { Task } from '../types';

interface EditTaskDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  open,
  task,
  onClose,
  onSave
}) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (task) {
      setContent(task.content);
    }
  }, [task]);

  const handleSave = () => {
    if (task && content.trim()) {
      onSave({
        ...task,
        content: content.trim()
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>编辑任务</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="任务内容"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskDialog; 
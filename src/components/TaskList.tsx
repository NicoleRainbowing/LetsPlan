import React from 'react';
import { List, ListItem, ListItemText, IconButton, Stack, Tooltip, useMediaQuery } from '@mui/material';
import { Task } from '../types';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import BookIcon from '@mui/icons-material/Book';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTheme } from '@mui/material/styles';
import RemoveIcon from '@mui/icons-material/Remove';

interface TaskListProps {
  tasks: Task[];
  type: 'longTerm' | 'doing' | 'todo' | 'done' | 'deleted';
  onEdit?: (task: Task) => void;
  onDoing?: (task: Task) => void;
  onDone?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onDiary?: (task: Task) => void;
  onTodo?: (task: Task) => void;
  onRestore?: (task: Task) => void;
  extraButtons?: (task: Task) => React.ReactNode[];
  onMoveTask?: (task: Task) => void;
}

const CATEGORY_ORDER = [
  "成长", "思考", "工作", "考研", "娱乐", "沟通", "副业", "生活"
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  "成长": "#ebebeb",
  "思考": "#d4e2ff",
  "工作": "#ffdbd8",
  "考研": "#ffdaa8",
  "娱乐": "#dac9fe",
  "沟通": "#e0ecd4",
  "副业": "#f9d3e1",
  "生活": "#caf1ff"
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  type,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formatTime = (time?: string) => {
    if (!time) return '';
    const date = new Date(time);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}年${month}月${day}日${hour}:${minute}:${second}`;
  };

  const renderTaskContent = (task: Task) => {
    const startTime = task.startTime ? formatTime(task.startTime) : '';
    const endTime = task.endTime ? `(${formatTime(task.endTime)}完成)` : '';
    return `${startTime} ${task.content} ${endTime}`;
  };

  const renderActionButton = (
    label: string,
    icon: React.ReactNode,
    onClick: (() => void) | undefined,
    color?: string
  ) => {
    if (!onClick) return null;
    
    if (label === 'Long' || label === 'Move') {
      return (
        <Tooltip title={label}>
          <IconButton 
            onClick={onClick}
            size="small"
            sx={{ 
              color: color || 'inherit',
              '&:hover': {
                bgcolor: `${color}22`
              },
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: isMobile ? '1.2rem' : '0.8rem',
            }}
          >
            {icon}
          </IconButton>
        </Tooltip>
      );
    }
    
    return (
      <Tooltip title={label}>
        <IconButton 
          onClick={onClick}
          size="small"
          sx={{ 
            color: color || 'inherit',
            '&:hover': {
              bgcolor: `${color}22`
            }
          }}
        >
          {icon}
        </IconButton>
      </Tooltip>
    );
  };

  // 按分类对任务进行分组
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const renderMobileButtons = (task: Task) => {
    switch (type) {
      case 'longTerm':
        return (
          <>
            {props.onMoveTask && renderActionButton('Move', "→", () => props.onMoveTask!(task), '#1976d2')}
            {props.onDoing && renderActionButton('Doing', <PlayArrowIcon />, () => props.onDoing!(task), '#4caf50')}
            {props.onTodo && renderActionButton('Todo', <AssignmentIcon />, () => props.onTodo!(task), '#ff9800')}
          </>
        );
      case 'doing':
        return (
          <>
            {props.onEdit && renderActionButton('Edit', <EditIcon />, () => props.onEdit!(task), '#2196f3')}
            {props.onMoveTask && renderActionButton('Long', "=", () => props.onMoveTask!(task), '#ff9800')}
            {props.onDone && renderActionButton('Done', <CheckIcon />, () => props.onDone!(task), '#4caf50')}
          </>
        );
      case 'done':
        return (
          <>
            {props.onEdit && renderActionButton('Edit', <EditIcon />, () => props.onEdit!(task), '#2196f3')}
            {props.onTodo && renderActionButton('Todo', <AssignmentIcon />, () => props.onTodo!(task), '#ff9800')}
            {props.onDelete && renderActionButton('Del', <DeleteIcon />, () => props.onDelete!(task), '#f44336')}
          </>
        );
      case 'todo':
        return (
          <>
            {props.onEdit && renderActionButton('Edit', <EditIcon />, () => props.onEdit!(task), '#2196f3')}
            {props.onDoing && renderActionButton('Doing', <PlayArrowIcon />, () => props.onDoing!(task), '#1976d2')}
            {props.onDelete && renderActionButton('Delete', <DeleteIcon />, () => props.onDelete!(task), '#f44336')}
          </>
        );
      default:
        return (
          <>
            {props.extraButtons && props.extraButtons(task)}
            {props.onEdit && renderActionButton('Edit', <EditIcon />, () => props.onEdit!(task), '#2196f3')}
            {props.onDoing && renderActionButton('Doing', <PlayArrowIcon />, () => props.onDoing!(task), '#1976d2')}
            {props.onDone && renderActionButton('Done', <CheckIcon />, () => props.onDone!(task), '#4caf50')}
            {props.onTodo && renderActionButton('Todo', <AssignmentIcon />, () => props.onTodo!(task), '#ff9800')}
            {props.onDiary && renderActionButton('Diary', <BookIcon />, () => props.onDiary!(task), '#9c27b0')}
            {props.onDelete && renderActionButton('Delete', <DeleteIcon />, () => props.onDelete!(task), '#f44336')}
          </>
        );
    }
  };

  const renderDesktopButtons = (task: Task) => (
    <>
      {props.extraButtons && props.extraButtons(task)}
      {props.onEdit && renderActionButton('Edit', <EditIcon />, () => props.onEdit!(task), '#2196f3')}
      {props.onDoing && renderActionButton('Doing', <PlayArrowIcon />, () => props.onDoing!(task), '#1976d2')}
      {props.onDone && renderActionButton('Done', <CheckIcon />, () => props.onDone!(task), '#4caf50')}
      {type === 'doing' && props.onMoveTask && renderActionButton('Long', "=", () => props.onMoveTask!(task), '#ff9800')}
      {props.onTodo && renderActionButton('Todo', <AssignmentIcon />, () => props.onTodo!(task), '#ff9800')}
      {props.onDiary && renderActionButton('Diary', <BookIcon />, () => props.onDiary!(task), '#9c27b0')}
      {props.onDelete && renderActionButton('Delete', <DeleteIcon />, () => props.onDelete!(task), '#f44336')}
    </>
  );

  // 按照预定义顺序渲染分类
  return (
    <List dense sx={{ py: 0 }}>
      {CATEGORY_ORDER.map(category => {
        const categoryTasks = groupedTasks[category];
        if (!categoryTasks?.length) return null;

        return (
          <React.Fragment key={category}>
            <ListItem
              sx={{
                py: 0.3,
                bgcolor: isMobile ? CATEGORY_COLORS[category] : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '4px 4px 0 0',
                mb: 0,
                mt: 1.5,
                borderLeft: '3px solid',
                borderColor: CATEGORY_COLORS[category],
                '&:first-of-type': {
                  mt: 0
                }
              }}
            >
              <ListItemText
                primary={category}
                primaryTypographyProps={{
                  sx: { 
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: isMobile ? '#004d64' : (type === 'done' ? 'text.primary' : 'white'),
                    letterSpacing: '0.5px'
                  }
                }}
              />
            </ListItem>
            {categoryTasks.map(task => (
              <ListItem
                key={task.id}
                sx={{
                  py: 0.3,
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.02)'
                  },
                  mb: 0,
                  pl: 2,
                  pr: 11,
                  borderLeft: '3px solid',
                  borderColor: 'rgba(0, 0, 0, 0.05)',
                  '&:last-child': {
                    borderRadius: '0 0 4px 4px',
                    mb: 0
                  }
                }}
                secondaryAction={
                  <Stack 
                    direction="row" 
                    spacing={0.5}
                    sx={{
                      '& .MuiIconButton-root': {
                        padding: isMobile ? 1 : 0.3,
                        marginLeft: 0.3,
                        '& .MuiSvgIcon-root': {
                          fontSize: isMobile ? '1.2rem' : '0.8rem'
                        }
                      },
                      transform: 'scale(0.85)',
                      mr: -1.5
                    }}
                  >
                    {isMobile ? renderMobileButtons(task) : renderDesktopButtons(task)}
                  </Stack>
                }
              >
                <ListItemText 
                  primary={renderTaskContent(task)}
                  primaryTypographyProps={{
                    sx: { 
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.3,
                      pr: 2,
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                />
              </ListItem>
            ))}
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default TaskList; 
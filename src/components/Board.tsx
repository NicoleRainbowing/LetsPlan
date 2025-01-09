import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, IconButton, Stack, Collapse } from '@mui/material';
import TaskList from './TaskList';
import TaskInput from './TaskInput';
import { BoardState, Task, TaskListKey, TaskCategory } from '../types';
import EditTaskDialog from './EditTaskDialog';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuickCopy from './QuickCopy';
import SummaryDialog from './SummaryDialog';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DragDropContext, Droppable, DropResult, DroppableProvided } from '@hello-pangea/dnd';
import DraggablePanel from './DraggablePanel';
import { v4 as uuidv4 } from 'uuid';

interface BoardProps {
  type: 'execution' | 'planning';
  state: BoardState;
  setState: (state: BoardState | ((prev: BoardState) => BoardState)) => void;
  onMoveTask?: (task: Task, fromList: TaskListKey) => void;
}

const Board: React.FC<BoardProps> = ({ type, state, setState, onMoveTask }) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [quickCopyExpanded, setQuickCopyExpanded] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [deletedExpanded, setDeletedExpanded] = useState(false);
  const [panels, setPanels] = useState([
    { id: 'leftColumn', content: 'left' },
    { id: 'middleColumn', content: 'middle' },
    { id: 'rightColumn', content: 'right' }
  ]);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    if (activeTimer) {
      const timer = setInterval(() => {
        setCurrentTime(Date.now());
        
        setState(prev => {
          const newState = { ...prev };
          (Object.keys(newState) as TaskListKey[]).forEach(key => {
            if (Array.isArray(newState[key])) {
              const task = newState[key].find(t => t.id === activeTimer);
              if (task && task.isRecording && task.lastRecordTime) {
                const elapsed = Math.floor((Date.now() - task.lastRecordTime) / 1000);
                task.duration = (task.duration || 0) + elapsed;
                task.lastRecordTime = Date.now();
              }
            }
          });
          return newState;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeTimer, setState]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleSaveEdit = (updatedTask: Task) => {
    setState((prev: BoardState) => {
      const newState = { ...prev };
      // 找到任务所在的列表
      (Object.keys(newState) as TaskListKey[]).forEach(key => {
        if (Array.isArray(newState[key])) {
          const index = newState[key].findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            newState[key] = [
              ...newState[key].slice(0, index),
              updatedTask,
              ...newState[key].slice(index + 1)
            ];
          }
        }
      });
      return newState;
    });
    setEditingTask(null);
  };

  const handleDoing = (task: Task, fromList: TaskListKey) => {
    const now = Date.now();
    const updatedTask = {
      ...task,
      startTime: task.startTime || new Date().toISOString(),
      isDone: false,
      endTime: undefined,
      isRecording: true,  // 自动开始计时
      lastRecordTime: now
    };

    // 停止当前正在计时的任务
    if (activeTimer) {
      setState(prev => {
        const newState = { ...prev };
        (Object.keys(newState) as TaskListKey[]).forEach(key => {
          if (Array.isArray(newState[key])) {
            const task = newState[key].find(t => t.id === activeTimer);
            if (task && task.isRecording) {
              const elapsed = Math.floor((now - (task.lastRecordTime || now)) / 1000);
              task.duration = (task.duration || 0) + elapsed;
              task.isRecording = false;
              task.lastRecordTime = undefined;
            }
          }
        });
        return newState;
      });
    }

    setActiveTimer(updatedTask.id);

    setState(prev => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      newState.doingTasks = [...prev.doingTasks, updatedTask];
      return newState;
    });
  };

  const handleDone = (task: Task, fromList: TaskListKey) => {
    const now = Date.now();
    const updatedTask = {
      ...task,
      endTime: new Date().toISOString(),
      isDone: true,
      isRecording: false,
      lastRecordTime: undefined
    };

    // 如果是正在计时的任务，更新最终时长
    if (task.isRecording && task.lastRecordTime) {
      const elapsed = Math.floor((now - task.lastRecordTime) / 1000);
      updatedTask.duration = (task.duration || 0) + elapsed;
    }

    if (activeTimer === task.id) {
      setActiveTimer(null);
    }

    setState(prev => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      newState.doneTasks = [...prev.doneTasks, updatedTask];
      return newState;
    });
  };

  const handleTodo = (task: Task, fromList: TaskListKey) => {
    const updatedTask = {
      ...task,
      startTime: undefined,
      endTime: undefined,
      isDone: false
    };

    setState((prev: BoardState) => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      newState.todoTasks = [...prev.todoTasks, updatedTask];
      return newState;
    });
  };

  const handleDelete = (task: Task, fromList: TaskListKey) => {
    setState((prev: BoardState) => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      newState.deletedTasks = [...prev.deletedTasks, task];
      return newState;
    });
  };

  const handleDiary = (task: Task, fromList: TaskListKey) => {
    const diaryTask: Task = {
      ...task,
      content: `${new Date().toISOString()}\n${task.content}\n`,
      category: "生活" as TaskCategory
    };

    setState((prev: BoardState) => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      newState.doneTasks = [...prev.doneTasks, diaryTask];
      return newState;
    });
  };

  const handleAddTask = (task: Task) => {
    if (task.isDone) {
      setState((prev: BoardState) => ({
        ...prev,
        doneTasks: [...prev.doneTasks, task]
      }));
    } else if (task.startTime) {
      setState((prev: BoardState) => ({
        ...prev,
        doingTasks: [...prev.doingTasks, task]
      }));
    } else {
      setState((prev: BoardState) => ({
        ...prev,
        todoTasks: [...prev.todoTasks, task]
      }));
    }
  };

  const handleClear = () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      setState({
        longTermTasks: [],
        doingTasks: [],
        todoTasks: [],
        doneTasks: [],
        deletedTasks: []
      });
    }
  };

  const renderTaskButtons = (task: Task, fromList: TaskListKey) => {
    const buttons = [];
    
    if (onMoveTask) {
      buttons.push(
        type === 'execution' ? (
          <IconButton 
            key="move" 
            onClick={() => onMoveTask(task, fromList)}
            size="small"
          >
            <ArrowForwardIcon />
          </IconButton>
        ) : (
          <IconButton 
            key="move" 
            onClick={() => onMoveTask(task, fromList)}
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
        )
      );
    }
    
    return buttons;
  };

  const handleSaveSummary = (userSummary: string, aiSummary: string) => {
    setState((prev: BoardState) => ({
      ...prev,
      summaryData: {
        userSummary,
        aiSummary,
        timestamp: new Date().toISOString()
      }
    }));
  };

  const handleAddDone = () => {
    const input = document.querySelector('textarea')?.value;
    if (!input?.trim()) return;
    
    handleAddTask({
      id: uuidv4(),
      content: input.trim(),
      category: determineCategory(input),
      isDone: true,
      endTime: new Date().toISOString()
    });
    
    // 清空输入框
    if (document.querySelector('textarea')) {
      (document.querySelector('textarea') as HTMLTextAreaElement).value = '';
    }
  };

  const handleAddDoing = () => {
    const input = document.querySelector('textarea')?.value;
    if (!input?.trim()) return;
    
    handleAddTask({
      id: uuidv4(),
      content: input.trim(),
      category: determineCategory(input),
      isDone: false,
      startTime: new Date().toISOString()
    });
    
    // 清空输入框
    if (document.querySelector('textarea')) {
      (document.querySelector('textarea') as HTMLTextAreaElement).value = '';
    }
  };

  const handleAddTodo = () => {
    const input = document.querySelector('textarea')?.value;
    if (!input?.trim()) return;
    
    handleAddTask({
      id: uuidv4(),
      content: input.trim(),
      category: determineCategory(input),
      isDone: false
    });
    
    // 清空输入框
    if (document.querySelector('textarea')) {
      (document.querySelector('textarea') as HTMLTextAreaElement).value = '';
    }
  };

  const determineCategory = (content: string): TaskCategory => {
    if (/学会|明白|掌握/.test(content)) return "成长";
    if (/发现|思考|学习/.test(content)) return "思考";
    if (/测试|项目|需求会|排期|产品|研发|对接|班课|灵犀|企微|mega|群发|班主任|一销|二销|讲师|灵云|裁剪|教研|CMS|盖亚|商城|工作/.test(content)) return "工作";
    if (/心理学|考研|英语|单词|政治|马哲|近代史|毛概|腿姐|肖1000|空卡/.test(content)) return "考研";
    if (/视频|广播剧|音乐|B站|小红书|抖音/.test(content)) return "娱乐";
    if (/沟通/.test(content)) return "沟通";
    if (/副业/.test(content)) return "副业";
    return "生活";
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newPanels = [...panels];
    const [removed] = newPanels.splice(result.source.index, 1);
    newPanels.splice(result.destination.index, 0, removed);
    setPanels(newPanels);
  };

  const handleMoveToLongTerm = (task: Task, fromList: TaskListKey) => {
    // 如果是从正在执行移动到长期规划，保持计时状态
    const keepTimer = fromList === 'doingTasks';
    
    setState(prev => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      newState.longTermTasks = [...prev.longTermTasks, {
        ...task,
        isRecording: keepTimer ? task.isRecording : false,
        lastRecordTime: keepTimer ? task.lastRecordTime : undefined
      }];
      return newState;
    });
  };

  const handleTimerClick = (taskId: string) => {
    setState(prev => {
      const newState = { ...prev };
      const now = Date.now();

      // 处理之前的计时任务
      if (activeTimer) {
        (Object.keys(newState) as TaskListKey[]).forEach(key => {
          if (Array.isArray(newState[key])) {
            const task = newState[key].find(t => t.id === activeTimer);
            if (task && task.isRecording) {
              const elapsed = Math.floor((now - (task.lastRecordTime || now)) / 1000);
              task.duration = (task.duration || 0) + elapsed;
              task.isRecording = false;
              task.lastRecordTime = undefined;
            }
          }
        });
      }

      // 处理当前任务
      (Object.keys(newState) as TaskListKey[]).forEach(key => {
        if (Array.isArray(newState[key])) {
          const task = newState[key].find(t => t.id === taskId);
          if (task) {
            if (!task.isRecording) {
              task.isRecording = true;
              task.lastRecordTime = now;
              setActiveTimer(taskId);
            } else {
              task.isRecording = false;
              task.lastRecordTime = undefined;
              setActiveTimer(null);
            }
          }
        }
      });

      return newState;
    });
  };

  const handleIncreaseCount = (taskId: string) => {
    setState(prev => {
      const newState = { ...prev };
      (Object.keys(newState) as TaskListKey[]).forEach(key => {
        if (Array.isArray(newState[key])) {
          const task = newState[key].find(t => t.id === taskId);
          if (task) {
            task.executionCount = (task.executionCount || 0) + 1;
          }
        }
      });
      return newState;
    });
  };

  const renderColumn = (columnId: string) => {
    switch (columnId) {
      case 'leftColumn':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ 
              p: 2, 
              bgcolor: 'primary.dark', 
              color: 'white',
              minHeight: '100px',
              height: 'fit-content',
              borderRadius: 2,
              boxShadow: 3
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                {type === 'execution' ? '持续进行' : '长期规划'}
              </Typography>
              <TaskList 
                tasks={state.longTermTasks} 
                type="longTerm"
                onEdit={handleEdit}
                onDoing={(task) => handleDoing(task, 'longTermTasks')}
                onDone={(task) => handleDone(task, 'longTermTasks')}
                onDelete={(task) => handleDelete(task, 'longTermTasks')}
                extraButtons={(task) => renderTaskButtons(task, 'longTermTasks')}
              />
            </Paper>

            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              boxShadow: 2
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>添加记录</Typography>
              <TaskInput onAdd={handleAddTask} />
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  mt: 2,
                  '& > button': {
                    flex: 1,
                    minWidth: 0,
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    px: 1
                  }
                }}
              >
                <Button variant="contained" color="success" onClick={handleAddDone}>+收获</Button>
                <Button variant="contained" color="primary" onClick={handleAddDoing}>+执行</Button>
                <Button 
                  variant="contained" 
                  color="warning" 
                  onClick={handleAddTodo}
                  sx={{ color: 'white' }}
                >
                  +待办
                </Button>
                <Button variant="contained" color="inherit" onClick={() => {}}>整理</Button>
                <Button 
                  variant="contained" 
                  onClick={() => setSummaryDialogOpen(true)}
                  sx={{ 
                    bgcolor: 'purple', 
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'darkpurple'
                    }
                  }}
                >
                  总结
                </Button>
                <Button variant="contained" color="error" onClick={handleClear}>清空</Button>
              </Stack>
            </Paper>
          </Box>
        );
      case 'middleColumn':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ 
              p: 2, 
              bgcolor: 'primary.main', 
              color: 'white',
              minHeight: '100px',
              height: 'fit-content',
              borderRadius: 2,
              boxShadow: 3
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>正在执行</Typography>
              <TaskList 
                tasks={state.doingTasks} 
                type="doing"
                onEdit={handleEdit}
                onDone={(task) => handleDone(task, 'doingTasks')}
                onTodo={(task) => handleTodo(task, 'doingTasks')}
                onDelete={(task) => handleDelete(task, 'doingTasks')}
                onMoveTask={(task) => handleMoveToLongTerm(task, 'doingTasks')}
                extraButtons={(task) => renderTaskButtons(task, 'doingTasks')}
              />
            </Paper>
            
            <Paper sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer'
              }} onClick={() => setQuickCopyExpanded(!quickCopyExpanded)}>
                <Typography variant="h6">快速复制</Typography>
                <IconButton size="small">
                  {quickCopyExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={quickCopyExpanded}>
                <QuickCopy
                  state={state}
                  expanded={quickCopyExpanded}
                  onToggle={() => setQuickCopyExpanded(!quickCopyExpanded)}
                  type={type}
                />
              </Collapse>
            </Paper>
          </Box>
        );
      case 'rightColumn':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ 
              p: 2, 
              bgcolor: 'warning.main', 
              color: 'white',
              minHeight: '100px',
              height: 'fit-content',
              borderRadius: 2,
              boxShadow: 3
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>待办事项</Typography>
              <TaskList 
                tasks={state.todoTasks} 
                type="todo"
                onEdit={handleEdit}
                onDoing={(task) => handleDoing(task, 'todoTasks')}
                onDone={(task) => handleDone(task, 'todoTasks')}
                onDelete={(task) => handleDelete(task, 'todoTasks')}
                extraButtons={(task) => renderTaskButtons(task, 'todoTasks')}
              />
            </Paper>
            
            <Paper sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer'
              }} onClick={() => setDeletedExpanded(!deletedExpanded)}>
                <Typography variant="h6">已删除</Typography>
                <IconButton size="small">
                  {deletedExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={deletedExpanded}>
                <TaskList 
                  tasks={state.deletedTasks}
                  type="todo"
                  onTodo={(task) => handleTodo(task, 'deletedTasks')}
                />
              </Collapse>
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2, 
        p: 2,
        maxWidth: 1400,
        mx: 'auto',
        width: '100%'
      }}>
        <Droppable droppableId="columns" direction="horizontal">
          {(provided: DroppableProvided) => (
            <Box 
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{ display: 'flex', gap: 2 }}
            >
              {panels.map((panel, index) => (
                <DraggablePanel
                  key={panel.id}
                  id={panel.id}
                  index={index}
                >
                  {renderColumn(panel.id)}
                </DraggablePanel>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>

        <Paper sx={{ 
          p: 3,
          borderRadius: 2,
          boxShadow: 2,
          bgcolor: 'background.paper'
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>今日收获</Typography>
          <TaskList 
            tasks={state.doneTasks}
            type="done"
            onEdit={handleEdit}
            onDoing={(task) => handleDoing(task, 'doneTasks')}
            onTodo={(task) => handleTodo(task, 'doneTasks')}
            onDiary={(task) => handleDiary(task, 'doneTasks')}
            onDelete={(task) => handleDelete(task, 'doneTasks')}
            extraButtons={(task) => renderTaskButtons(task, 'doneTasks')}
          />
        </Paper>
        
        <SummaryDialog
          open={summaryDialogOpen}
          onClose={() => setSummaryDialogOpen(false)}
          state={state}
          onSave={handleSaveSummary}
          existingSummary={state.summaryData?.userSummary}
        />
        
        <EditTaskDialog
          open={Boolean(editingTask)}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveEdit}
        />
      </Box>
    </DragDropContext>
  );
};

export default Board; 
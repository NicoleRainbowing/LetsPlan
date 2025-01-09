import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Stack, Divider, IconButton, useMediaQuery, Dialog, Button, TextField } from '@mui/material';
import TaskList from '../TaskList';
import TaskInput from '../TaskInput';
import { BoardState, Task, TaskListKey } from '../../types';
import EditTaskDialog from '../EditTaskDialog';
import QuickCopy from '../QuickCopy';
import SummaryDialog from '../SummaryDialog';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MobileTaskInput from './MobileTaskInput';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SummarizeIcon from '@mui/icons-material/Summarize';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { useScrollTrigger } from '@mui/material';
import { Slide } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

interface MobileBoardProps {
  type: 'execution' | 'planning';
  state: BoardState;
  setState: (state: BoardState | ((prev: BoardState) => BoardState)) => void;
  onMoveTask?: (task: Task, fromList: TaskListKey) => void;
  onClear: () => void;
}

const initialState: BoardState = {
  longTermTasks: [],
  doingTasks: [],
  todoTasks: [],
  doneTasks: [],
  deletedTasks: []
};

const determineCategory = (content: string): Task['category'] => {
  if (/学会|明白|掌握/.test(content)) return "成长";
  if (/发现|思考|学习/.test(content)) return "思考";
  if (/测试|项目|需求会|排期|产品|研发|对接|班课|灵犀|企微|mega|群发|班主任|一销|二销|讲师|灵云|裁剪|教研|CMS|盖亚|商城|工作/.test(content)) return "工作";
  if (/心理学|考研|英语|单词|政治|马哲|近代史|毛概|腿姐|肖1000|空卡/.test(content)) return "考研";
  if (/视频|广播剧|音乐|B站|小红书|抖音/.test(content)) return "娱乐";
  if (/沟通/.test(content)) return "沟通";
  if (/副业/.test(content)) return "副业";
  return "生活";
};

const MobileBoard: React.FC<MobileBoardProps> = ({ type, state, setState, onMoveTask, onClear }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [quickCopyExpanded, setQuickCopyExpanded] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [deletedExpanded, setDeletedExpanded] = useState(false);
  const [sections, setSections] = useState({
    todo: true,
    longTerm: true,
    doing: true,
    done: true,
    deleted: true,
    input: true
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showTopMenu, setShowTopMenu] = useState(true);
  const [showBottomMenu, setShowBottomMenu] = useState(true);
  const [addTaskInput, setAddTaskInput] = useState('');

  // 处理滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowTopMenu(currentScrollY < lastScrollY || currentScrollY < 50);
      setShowBottomMenu(currentScrollY > lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // 顶部菜单动作
  const handleAddClick = () => {
    setAddDialogOpen(true);
  };

  const handleSummaryClick = () => {
    setSummaryDialogOpen(true);
  };

  const handleClearClick = () => {
    if (window.confirm('确定要清空所有内容吗？')) {
      onClear();
    }
  };

  // 复用原有的处理函数
  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleSaveEdit = (updatedTask: Task) => {
    setState((prev: BoardState) => {
      const newState = { ...prev };
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
    setState(prev => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      newState.doingTasks = [...prev.doingTasks, { ...task, startTime: new Date().toISOString() }];
      return newState;
    });
  };

  const handleDone = (task: Task, fromList: TaskListKey) => {
    setState(prev => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      newState.doneTasks = [...prev.doneTasks, { ...task, endTime: new Date().toISOString() }];
      return newState;
    });
  };

  const handleDelete = (task: Task, fromList: TaskListKey) => {
    setState(prev => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      newState.deletedTasks = [...prev.deletedTasks, task];
      return newState;
    });
  };

  const handleAdd = (task: Task) => {
    setState(prev => ({
      ...prev,
      [task.isDone ? 'doneTasks' : task.startTime ? 'doingTasks' : 'todoTasks']: [
        ...prev[task.isDone ? 'doneTasks' : task.startTime ? 'doingTasks' : 'todoTasks'],
        task
      ]
    }));
  };

  const handleRestore = (task: Task) => {
    setState(prev => {
      const newState = { ...prev };
      newState.deletedTasks = prev.deletedTasks.filter(t => t.id !== task.id);
      newState.todoTasks = [...prev.todoTasks, task];
      return newState;
    });
  };

  const handleSaveSummary = (userSummary: string, aiSummary: string) => {
    setState(prev => ({
      ...prev,
      summaryData: {
        userSummary,
        aiSummary,
        timestamp: new Date().toISOString()
      }
    }));
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const SectionHeader = ({ 
    title, 
    section, 
    count 
  }: { 
    title: string; 
    section: keyof typeof sections;
    count?: number;
  }) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {title}{!sections[section] && count !== undefined && `（${count}）`}
      </Typography>
      <IconButton size="small" onClick={() => toggleSection(section)}>
        {sections[section] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </Stack>
  );

  const handleMoveToLongTerm = (task: Task, fromList: TaskListKey) => {
    setState(prev => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      newState.longTermTasks = [...prev.longTermTasks, task];
      return newState;
    });
  };

  const handleTodo = (task: Task, fromList: TaskListKey) => {
    setState(prev => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      newState.todoTasks = [...prev.todoTasks, { ...task, startTime: undefined, endTime: undefined }];
      return newState;
    });
  };

  return (
    <Box>
      {/* 顶部悬浮菜单 */}
      <Slide in={showTopMenu} direction="down">
        <Paper
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider'
          }}
          elevation={3}
        >
          <Stack
            direction="row"
            justifyContent="space-around"
            sx={{ py: 1 }}
          >
            <IconButton onClick={handleAddClick} color="primary">
              <AddIcon />
            </IconButton>
            <IconButton onClick={handleSummaryClick} color="primary">
              <SummarizeIcon />
            </IconButton>
            <IconButton onClick={handleClearClick} color="error">
              <CleaningServicesIcon />
            </IconButton>
          </Stack>
        </Paper>
      </Slide>

      {/* 添加任务弹窗 */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Stack spacing={2} sx={{ p: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={addTaskInput}
            onChange={(e) => setAddTaskInput(e.target.value)}
            placeholder="请输入任务内容"
          />
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              if (!addTaskInput.trim()) return;
              handleAdd({
                id: uuidv4(),
                content: addTaskInput.trim(),
                category: determineCategory(addTaskInput),
                isDone: true,
              });
              setAddTaskInput('');
              setAddDialogOpen(false);
            }}
            fullWidth
          >
            +收获
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (!addTaskInput.trim()) return;
              handleAdd({
                id: uuidv4(),
                content: addTaskInput.trim(),
                category: determineCategory(addTaskInput),
                isDone: false,
                startTime: new Date().toISOString()
              });
              setAddTaskInput('');
              setAddDialogOpen(false);
            }}
            fullWidth
          >
            +执行
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              if (!addTaskInput.trim()) return;
              handleAdd({
                id: uuidv4(),
                content: addTaskInput.trim(),
                category: determineCategory(addTaskInput),
                isDone: false
              });
              setAddTaskInput('');
              setAddDialogOpen(false);
            }}
            fullWidth
          >
            +待办
          </Button>
        </Stack>
      </Dialog>

      {/* 主内容 */}
      <Stack spacing={2} sx={{ p: 2, pb: 8, mt: 7 }}>
        {/* 待办事项 */}
        <Paper sx={{ p: 2 }}>
          <SectionHeader 
            title="待办事项" 
            section="todo" 
            count={state.todoTasks.length}
          />
          {sections.todo && (
            <TaskList
              tasks={state.todoTasks}
              type="todo"
              onEdit={handleEdit}
              onDoing={(task) => handleDoing(task, 'todoTasks')}
              onDelete={(task) => handleDelete(task, 'todoTasks')}
            />
          )}
        </Paper>

        {/* 长期规划/持续进行 */}
        <Paper sx={{ p: 2 }}>
          <SectionHeader 
            title={type === 'execution' ? "持续进行" : "长期规划"} 
            section="longTerm"
            count={state.longTermTasks.length}
          />
          {sections.longTerm && (
            <TaskList
              tasks={state.longTermTasks}
              type="longTerm"
              onEdit={handleEdit}
              onMoveTask={task => onMoveTask?.(task, 'longTermTasks')}
              onDoing={(task) => handleDoing(task, 'longTermTasks')}
              onTodo={(task) => handleTodo(task, 'longTermTasks')}
            />
          )}
        </Paper>

        {/* 正在执行 */}
        <Paper sx={{ p: 2 }}>
          <SectionHeader 
            title="正在执行" 
            section="doing"
            count={state.doingTasks.length}
          />
          {sections.doing && (
            <TaskList
              tasks={state.doingTasks}
              type="doing"
              onEdit={handleEdit}
              onDone={(task) => handleDone(task, 'doingTasks')}
              onDelete={(task) => handleDelete(task, 'doingTasks')}
              onMoveTask={(task) => handleMoveToLongTerm(task, 'doingTasks')}
            />
          )}
        </Paper>

        {/* 今日收获 */}
        <Paper sx={{ p: 2 }}>
          <SectionHeader 
            title="今日收获" 
            section="done"
            count={state.doneTasks.length}
          />
          {sections.done && (
            <TaskList
              tasks={state.doneTasks}
              type="done"
              onEdit={handleEdit}
              onTodo={(task) => handleTodo(task, 'doneTasks')}
              onDelete={(task) => handleDelete(task, 'doneTasks')}
            />
          )}
        </Paper>

        {/* 快速复制 */}
        <QuickCopy
          state={state}
          expanded={quickCopyExpanded}
          onToggle={() => setQuickCopyExpanded(!quickCopyExpanded)}
          type={type}
        />

        {/* 已删除 */}
        <Paper sx={{ p: 2 }}>
          <SectionHeader 
            title="已删除任务" 
            section="deleted"
            count={state.deletedTasks.length}
          />
          {sections.deleted && (
            <TaskList
              tasks={state.deletedTasks}
              type="deleted"
              onRestore={handleRestore}
            />
          )}
        </Paper>

        <EditTaskDialog
          open={Boolean(editingTask)}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveEdit}
        />

        <SummaryDialog
          open={summaryDialogOpen}
          onClose={() => setSummaryDialogOpen(false)}
          state={state}
          onSave={handleSaveSummary}
          existingSummary={state.summaryData?.userSummary}
        />
      </Stack>
    </Box>
  );
};

export default MobileBoard; 
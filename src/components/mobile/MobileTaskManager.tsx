import React, { useState } from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Paper, Slide } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MobileBoard from './MobileBoard';
import { BoardState, Task, TaskListKey } from '../../types';
import useLocalStorage from '../../hooks/useLocalStorage';

const initialState: BoardState = {
  longTermTasks: [],
  doingTasks: [],
  todoTasks: [],
  doneTasks: [],
  deletedTasks: []
};

const MobileTaskManager: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [executionState, setExecutionState] = useLocalStorage('executionBoard', initialState);
  const [planningState, setPlanningState] = useLocalStorage('planningBoard', initialState);
  const [showBottomMenu, setShowBottomMenu] = useState(true);

  const handleMoveToPlanning = (task: Task, fromList: TaskListKey) => {
    setExecutionState(prev => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      return newState;
    });

    setPlanningState(prev => {
      const newState = { ...prev };
      newState[fromList] = [...prev[fromList], task];
      return newState;
    });
  };

  const handleMoveToExecution = (task: Task, fromList: TaskListKey) => {
    setPlanningState(prev => {
      const newState = { ...prev };
      newState[fromList] = prev[fromList].filter(t => t.id !== task.id);
      return newState;
    });

    setExecutionState(prev => {
      const newState = { ...prev };
      newState[fromList] = [...prev[fromList], task];
      return newState;
    });
  };

  const handleClearCurrentBoard = () => {
    const emptyBoard = {
      longTermTasks: [],
      doingTasks: [],
      todoTasks: [],
      doneTasks: [],
      deletedTasks: [],
    };

    if (currentTab === 0) {
      const newState = {
        ...emptyBoard,
        summaryData: executionState.summaryData
      };
      window.localStorage.setItem('executionBoard', JSON.stringify(newState));
      window.location.reload(); // 强制刷新页面
    } else if (currentTab === 1) {
      const newState = {
        ...emptyBoard,
        summaryData: planningState.summaryData
      };
      window.localStorage.setItem('planningBoard', JSON.stringify(newState));
      window.location.reload(); // 强制刷新页面
    }
  };

  return (
    <Box sx={{ pb: 7 }}>
      {/* 主内容区域 */}
      <Box hidden={currentTab !== 0}>
        {currentTab === 0 && (
          <MobileBoard
            type="execution"
            state={executionState}
            setState={setExecutionState}
            onMoveTask={handleMoveToPlanning}
            onClear={handleClearCurrentBoard}
          />
        )}
      </Box>
      <Box hidden={currentTab !== 1}>
        {currentTab === 1 && (
          <MobileBoard
            type="planning"
            state={planningState}
            setState={setPlanningState}
            onMoveTask={handleMoveToExecution}
            onClear={handleClearCurrentBoard}
          />
        )}
      </Box>
      <Box hidden={currentTab !== 2}>
        {currentTab === 2 && (
          <Paper 
            sx={{ 
              height: '100vh',
              bgcolor: '#C7EDCC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              color: '#2E7D32'
            }}
          >
            休息一下，保护眼睛
          </Paper>
        )}
      </Box>

      {/* 底部导航栏 */}
      <Slide in={showBottomMenu} direction="up">
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            zIndex: 1000
          }} 
          elevation={3}
        >
          <BottomNavigation
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            showLabels
          >
            <BottomNavigationAction label="执行大盘" icon={<AssignmentIcon />} />
            <BottomNavigationAction label="规划大盘" icon={<EventNoteIcon />} />
            <BottomNavigationAction label="休息眼睛" icon={<VisibilityOffIcon />} />
          </BottomNavigation>
        </Paper>
      </Slide>
    </Box>
  );
};

export default MobileTaskManager; 
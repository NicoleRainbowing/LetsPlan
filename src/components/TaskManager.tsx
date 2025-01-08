import React, { useState } from 'react';
import { Grid, Tabs, Tab, Box, Paper } from '@mui/material';
import ExecutionBoard from './ExecutionBoard';
import PlanningBoard from './PlanningBoard';
import { Task, BoardState, TaskListKey } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

const initialState: BoardState = {
  longTermTasks: [],
  doingTasks: [],
  todoTasks: [],
  doneTasks: [],
  deletedTasks: []
};

const TaskManager: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [executionState, setExecutionState] = useLocalStorage('executionBoard', initialState);
  const [planningState, setPlanningState] = useLocalStorage('planningBoard', initialState);

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

  return (
    <Box>
      <Tabs 
        value={currentTab} 
        onChange={(_, newValue) => setCurrentTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="执行大盘" />
        <Tab label="规划大盘" />
        <Tab label="休息眼睛" />
      </Tabs>

      <Box hidden={currentTab !== 0}>
        {currentTab === 0 && (
          <ExecutionBoard
            state={executionState}
            setState={setExecutionState}
            onMoveTask={handleMoveToPlanning}
          />
        )}
      </Box>
      <Box hidden={currentTab !== 1}>
        {currentTab === 1 && (
          <PlanningBoard
            state={planningState}
            setState={setPlanningState}
            onMoveTask={handleMoveToExecution}
          />
        )}
      </Box>
      <Box hidden={currentTab !== 2}>
        {currentTab === 2 && (
          <Paper 
            sx={{ 
              height: '100vh',
              bgcolor: '#C7EDCC', // 护眼绿色
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: '#2E7D32',
              userSelect: 'none'
            }}
          >
            休息一下，保护眼睛
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default TaskManager; 
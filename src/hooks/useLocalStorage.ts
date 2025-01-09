import { useState, useEffect } from 'react';
import { BoardState, Task, TaskListKey } from '../types';

const useLocalStorage = (key: string, initialValue: BoardState) => {
  // 获取初始值
  const [state, setState] = useState<BoardState>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedState = JSON.parse(item);
        // 恢复计时状态
        Object.keys(parsedState).forEach((listKey) => {
          if (Array.isArray(parsedState[listKey])) {
            parsedState[listKey].forEach((task: Task) => {
              if (task.isRecording && task.lastRecordTime) {
                const elapsed = Math.floor((Date.now() - task.lastRecordTime) / 1000);
                task.duration = (task.duration || 0) + elapsed;
                task.isRecording = false;
                task.lastRecordTime = undefined;
              }
            });
          }
        });
        return parsedState;
      }
      return initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // 当 state 改变时更新 localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, state]);

  // 添加清空函数
  const clearState = () => {
    const summaryData = state.summaryData;
    setState({
      longTermTasks: [],
      doingTasks: [],
      todoTasks: [],
      doneTasks: [],
      deletedTasks: [],
      summaryData
    });
  };

  return [state, setState, clearState] as const;
};

export default useLocalStorage; 
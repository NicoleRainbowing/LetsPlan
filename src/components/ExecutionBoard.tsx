import React from 'react';
import Board from './Board';
import { BoardState, Task, TaskListKey } from '../types';

interface ExecutionBoardProps {
  state: BoardState;
  setState: (state: BoardState | ((prev: BoardState) => BoardState)) => void;
  onMoveTask: (task: Task, fromList: TaskListKey) => void;
}

const ExecutionBoard: React.FC<ExecutionBoardProps> = ({ state, setState, onMoveTask }) => {
  return (
    <Board
      type="execution"
      state={state}
      setState={setState}
      onMoveTask={onMoveTask}
    />
  );
};

export default ExecutionBoard; 
import React from 'react';
import Board from './Board';
import { BoardState, Task, TaskListKey } from '../types';

interface PlanningBoardProps {
  state: BoardState;
  setState: (state: BoardState | ((prev: BoardState) => BoardState)) => void;
  onMoveTask: (task: Task, fromList: TaskListKey) => void;
}

const PlanningBoard: React.FC<PlanningBoardProps> = ({ state, setState, onMoveTask }) => {
  return (
    <Board
      type="planning"
      state={state}
      setState={setState}
      onMoveTask={onMoveTask}
    />
  );
};

export default PlanningBoard; 
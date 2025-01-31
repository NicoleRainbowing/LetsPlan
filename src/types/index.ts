export type TaskCategory = 
  | "成长" 
  | "思考" 
  | "工作" 
  | "考研" 
  | "娱乐" 
  | "沟通" 
  | "副业" 
  | "生活";

export interface Task {
  id: string;
  content: string;
  startTime?: string;
  endTime?: string;
  category: TaskCategory;
  isDone: boolean;
  isPart?: boolean;
}

export interface SummaryData {
  userSummary: string;
  aiSummary: string;
  timestamp: string;
}

export interface BoardState {
  longTermTasks: Task[];
  doingTasks: Task[];
  todoTasks: Task[];
  doneTasks: Task[];
  deletedTasks: Task[];
  summaryData?: SummaryData;
}

// 添加一个类型帮助函数
export type TaskListKey = Exclude<keyof BoardState, 'summaryData'>; 
import React, { useState, KeyboardEvent } from 'react';
import { Box, TextField } from '@mui/material';
import { Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TaskInputProps {
  onAdd: (task: Task) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAdd }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter 用于换行，不需要处理
        return;
      }
      
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) { // metaKey 用于支持 Mac 的 Command 键
        // Ctrl/Command + Enter: 添加正在执行
        handleAddDoing();
      } else if (e.altKey) {
        // Alt + Enter: 添加待办
        handleAddTodo();
      } else {
        // 普通 Enter: 添加收获
        handleAddDone();
      }
    }
  };

  const createTask = (isDone: boolean = false): Task => ({
    id: uuidv4(),
    content: input.trim(),
    category: determineCategory(input),
    isDone,
    startTime: isDone ? undefined : new Date().toISOString(),
    endTime: isDone ? new Date().toISOString() : undefined,
  });

  const handleAddDone = () => {
    if (!input.trim()) return;
    onAdd(createTask(true));
    setInput('');
  };

  const handleAddDoing = () => {
    if (!input.trim()) return;
    onAdd(createTask(false));
    setInput('');
  };

  const handleAddTodo = () => {
    if (!input.trim()) return;
    onAdd({ ...createTask(false), startTime: undefined });
    setInput('');
  };

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        minRows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`请添加新内容
快捷键：
       Enter    → 添加收获
Shift+ Enter → 换行
Ctrl + Enter → 添加正在执行
 Alt + Enter → 添加待办`}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontFamily: 'monospace', // 使用等宽字体以保持对齐
          }
        }}
      />
    </Box>
  );
};

// 根据内容智能判断分类
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

export default TaskInput; 
import React, { useState, KeyboardEvent } from 'react';
import { Box, TextField, Button, Stack, useMediaQuery, useTheme } from '@mui/material';
import { Task } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface TaskInputProps {
  onAdd: (task: Task) => void;
}

const MobileTaskInput: React.FC<TaskInputProps> = ({ onAdd }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAdd = (isDone: boolean = false) => {
    if (!input.trim()) return;
    onAdd({
      id: uuidv4(),
      content: input.trim(),
      category: determineCategory(input),
      isDone,
      startTime: isDone ? undefined : new Date().toISOString(),
    });
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="请添加新内容"
        sx={{
          '& .MuiOutlinedInput-root': {
            fontFamily: 'monospace',
          }
        }}
      />
      {isMobile && isFocused && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 1,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            zIndex: 1100
          }}
        >
          <Button
            variant="contained"
            color="success"
            onClick={() => handleAdd(true)}
            sx={{ flex: 1 }}
          >
            +收获
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAdd(false)}
            sx={{ flex: 1 }}
          >
            +执行
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => handleAdd(false)}
            sx={{ flex: 1 }}
          >
            +待办
          </Button>
        </Stack>
      )}
    </Box>
  );
};

// 根据内容智能判断分类（保持原有逻辑）
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

export default MobileTaskInput; 
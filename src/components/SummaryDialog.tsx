import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Task, BoardState } from '../types';
import { isHoliday, formatHolidayInfo } from '../utils/holidayUtils';

interface SummaryDialogProps {
  open: boolean;
  onClose: () => void;
  state: BoardState;
  onSave: (summary: string, aiSummary: string) => void;
  existingSummary?: string;
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({
  open,
  onClose,
  state,
  onSave,
  existingSummary = ''
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [userSummary, setUserSummary] = useState(existingSummary);
  const [aiSummary, setAiSummary] = useState('');

  const generateAiSummary = useCallback(async () => {
    const today = new Date();
    const { isHoliday: isHol, holidayName } = await isHoliday(today);
    const holidayInfo = await formatHolidayInfo(today);
    
    // 分析任务完成情况
    const completedTasks = state.doneTasks;
    const workTasks = completedTasks.filter(t => t.category === '工作');
    const studyTasks = completedTasks.filter(t => t.category === '考研');
    const thinkingTasks = completedTasks.filter(t => t.category === '思考');
    const growthTasks = completedTasks.filter(t => t.category === '成长');
    const sideTasks = completedTasks.filter(t => t.category === '副业');
    const lifeTasks = completedTasks.filter(t => t.category === '生活').filter(t => !t.content.includes('狗'));
    const entertainmentTasks = completedTasks.filter(t => t.category === '娱乐');
    const communicationTasks = completedTasks.filter(t => t.category === '沟通');

    let summary = '';
    const timeNow = new Date();
    const isNightTime = timeNow.getHours() >= 21;

    // 添加假期提醒
    if (holidayInfo) {
      summary += `今天是${holidayInfo}，`;
      if (workTasks.length > 3) {
        summary += '工作任务较多，建议调整到工作日处理。\n';
      } else {
        summary += '希望您能好好放松！\n';
      }
    }

    // 优先级分析
    const priorities = [
      { name: '考研', tasks: studyTasks, weight: 5 },
      { name: '思考', tasks: thinkingTasks, weight: 4 },
      { name: '成长', tasks: growthTasks, weight: 4 },
      { name: '副业', tasks: sideTasks, weight: 3 },
      { name: '生活', tasks: lifeTasks, weight: 2 }
    ];

    // 计算平衡得分
    const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0);
    const balanceScore = priorities.reduce((score, p) => {
      const expectedRatio = p.weight / totalWeight;
      const actualRatio = p.tasks.length / completedTasks.length || 0;
      return score - Math.abs(expectedRatio - actualRatio);
    }, 1);

    // 工作分析（非假期）
    if (!isHol) {
      const workAnalysis = analyzeWorkTasks(workTasks, timeNow);
      summary += workAnalysis;
    }

    // 学习分析
    const studyAnalysis = analyzeStudyTasks(studyTasks, timeNow);
    summary += studyAnalysis;

    // 思考与成长分析
    const growthAnalysis = analyzeGrowthTasks(thinkingTasks, growthTasks, timeNow);
    summary += growthAnalysis;

    // 生活平衡分析
    const lifeBalanceAnalysis = analyzeLifeBalance(
      lifeTasks,
      entertainmentTasks,
      communicationTasks,
      isNightTime
    );
    summary += lifeBalanceAnalysis;

    // 任务积压分析
    const backlogAnalysis = analyzeBacklog(state);
    summary += backlogAnalysis;

    // 总体评价
    summary += generateOverallEvaluation(balanceScore, isNightTime);

    setAiSummary(summary);
  }, [state]);

  useEffect(() => {
    let mounted = true;

    const runAnalysis = async () => {
      if (open && mounted) {
        await generateAiSummary();
      }
    };

    void runAnalysis();

    return () => {
      mounted = false;
    };
  }, [open, state, generateAiSummary]);

  // 辅助函数
  const analyzeWorkTasks = (workTasks: Task[], timeNow: Date) => {
    let analysis = '';
    if (workTasks.length > 8) {
      analysis += '⚠️ 今天的工作任务量过大，请注意避免过度疲劳。建议：\n';
      analysis += '1. 适当休息，保持精力充沛\n';
      analysis += '2. 考虑任务优先级，合理分配时间\n';
    } else if (workTasks.length < 2 && timeNow.getHours() >= 14) {
      analysis += '今天的工作任务较少，建议检查是否有遗漏的重要工作。\n';
    }
    return analysis;
  };

  const analyzeStudyTasks = (studyTasks: Task[], timeNow: Date) => {
    let analysis = '';
    if (studyTasks.length === 0) {
      analysis += '📚 今天还没有考研相关的学习记录，建议：\n';
      analysis += '1. 即使工作繁忙，也要保证每天的学习时间\n';
      analysis += '2. 可以利用碎片时间背单词或做题\n';
    } else {
      const studyTypes = new Set(studyTasks.map(t => {
        if (t.content.includes('英语')) return '英语';
        if (t.content.includes('政治')) return '政治';
        if (t.content.includes('数学')) return '数学';
        return '其他';
      }));
      analysis += `🎯 今天学习了${studyTypes.size}个科目，`;
      if (studyTypes.size < 3) {
        analysis += '建议适当扩展学习范围，保持各科均衡。\n';
      } else {
        analysis += '学习科目分配合理！\n';
      }
    }
    return analysis;
  };

  const analyzeGrowthTasks = (thinkingTasks: Task[], growthTasks: Task[], timeNow: Date) => {
    let analysis = '';
    const totalGrowth = thinkingTasks.length + growthTasks.length;
    if (totalGrowth === 0) {
      analysis += '💡 今天在个人成长方面的投入较少，建议：\n';
      analysis += '1. 每天留出时间进行思考和总结\n';
      analysis += '2. 记录学习心得和感悟\n';
    } else {
      analysis += '🌱 很好！今天有进行自我提升和思考。\n';
      if (thinkingTasks.length > 0) {
        analysis += `特别是在思考方面有${thinkingTasks.length}个收获。\n`;
      }
    }
    return analysis;
  };

  const analyzeLifeBalance = (
    lifeTasks: Task[],
    entertainmentTasks: Task[],
    communicationTasks: Task[],
    isNightTime: boolean
  ) => {
    let analysis = '';
    if (lifeTasks.length === 0 && entertainmentTasks.length === 0) {
      analysis += '⚖️ 今天似乎太专注于工作和学习，建议：\n';
      analysis += '1. 适当安排运动和休闲活动\n';
      analysis += '2. 保持作息规律，注意身心健康\n';
    }
    
    if (communicationTasks.length === 0 && isNightTime) {
      analysis += '💬 今天似乎没有什么社交活动，要记得与亲友保持联系哦！\n';
    }
    
    return analysis;
  };

  const analyzeBacklog = (state: BoardState) => {
    let analysis = '';
    const unfinishedTasks = [...state.todoTasks, ...state.doingTasks];
    const urgentTasks = unfinishedTasks.filter(t => 
      t.content.includes('紧急') || t.content.includes('重要')
    );

    if (unfinishedTasks.length > 10) {
      analysis += '📋 待办事项较多，建议：\n';
      analysis += '1. 对任务进行优先级排序\n';
      analysis += '2. 考虑是否有可以委托或取消的任务\n';
      if (urgentTasks.length > 0) {
        analysis += `3. 优先处理${urgentTasks.length}个紧急/重要的任务\n`;
      }
    }
    return analysis;
  };

  const generateOverallEvaluation = (balanceScore: number, isNightTime: boolean) => {
    let evaluation = '\n📊 总体评价：\n';
    if (balanceScore > 0.8) {
      evaluation += '今天的时间分配非常均衡，继续保持！\n';
    } else if (balanceScore > 0.6) {
      evaluation += '今天的任务分配基本合理，可以适当调整以达到更好的平衡。\n';
    } else {
      evaluation += '今天的任务分配有些失衡，建议参考上述建议进行调整。\n';
    }

    if (isNightTime) {
      evaluation += '🌙 夜已深，请注意休息。记得为明天做好规划！\n';
    }

    return evaluation;
  };

  const handleSave = () => {
    onSave(userSummary, aiSummary);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {currentPage === 0 ? (
        <>
          <DialogTitle>任务总结 - 任务概览</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h6">正在执行 & 长期规划</Typography>
                <List>
                  {[...state.doingTasks, ...state.longTermTasks].map(task => (
                    <ListItem key={task.id}>
                      <ListItemText primary={task.content} secondary={task.category} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">待办事项 & 今日收获</Typography>
                <List>
                  {[...state.todoTasks, ...state.doneTasks].map(task => (
                    <ListItem key={task.id}>
                      <ListItemText primary={task.content} secondary={task.category} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>取消</Button>
            <Button onClick={() => setCurrentPage(1)}>下一步</Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>任务总结 - 总结内容</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                AI 分析总结
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {aiSummary}
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="本日总结"
              value={userSummary}
              onChange={(e) => setUserSummary(e.target.value)}
              placeholder="请输入您的总结..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCurrentPage(0)}>上一步</Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              保存
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default SummaryDialog; 
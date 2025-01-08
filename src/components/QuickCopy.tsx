import React from 'react';
import { Paper, Typography, IconButton, Collapse, Button, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Task, BoardState } from '../types';

interface QuickCopyProps {
  state: BoardState;
  expanded: boolean;
  onToggle: () => void;
  type: 'execution' | 'planning';
}

const QuickCopy: React.FC<QuickCopyProps> = ({ state, expanded, onToggle, type }) => {
  const formatTaskForCopy = (task: Task) => {
    const startTime = task.startTime ? formatTime(task.startTime) : '';
    const endTime = task.endTime ? `(${formatTime(task.endTime)}完成)` : '';
    return `${startTime} ${task.content} ${endTime}`;
  };

  const getDiaryEntries = () => {
    return state.doneTasks
      .filter(task => task.content.includes('\n'))
      .map(task => task.content)
      .join('\n');
  };

  const formatTasksByCategory = (tasks: Task[]) => {
    const categories: Record<string, Task[]> = {
      "成长": [],
      "思考": [],
      "工作": [],
      "考研": [],
      "娱乐": [],
      "沟通": [],
      "副业": [],
      "生活": []
    };

    tasks.forEach(task => {
      categories[task.category].push(task);
    });

    return Object.entries(categories)
      .map(([category, tasks]) => {
        if (tasks.length === 0) return '';
        return `_    ${category.padEnd(4, '  ')}    _\n${
          tasks.map((task, index) => `${index + 1}、${formatTaskForCopy(task)}`).join('\n')
        }`;
      })
      .filter(Boolean)
      .join('\n\n');
  };

  const getFormattedContent = () => {
    return `日记：
${getDiaryEntries()}

——————Done——————
${formatTasksByCategory(state.doneTasks)}

🌸doing🌸
${formatTasksByCategory([...state.doingTasks, ...state.longTermTasks])}

_待排_
${formatTasksByCategory(state.todoTasks)}

——————AI日总结—————

——————本日总结—————
`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFormattedContent());
      alert('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制');
    }
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}年${month}月${day}日${hour}:${minute}:${second}`;
  };

  const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    "成长": { bg: "#ebebeb", text: "#004d64" },
    "思考": { bg: "#d4e2ff", text: "#004d64" },
    "工作": { bg: "#FFDBD8", text: "#004d64" },
    "考研": { bg: "#ffdaa8", text: "#004d64" },
    "娱乐": { bg: "#dac9fe", text: "#004d64" },
    "沟通": { bg: "#e0ecd4", text: "#004d64" },
    "副业": { bg: "#f9d3e1", text: "#004d64" },
    "生活": { bg: "#caf1ff", text: "#004d64" }
  };

  const handleExportRTF = () => {
    const content = getFormattedContent();
    
    // 将十六进制颜色转换为 RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // 生成颜色表
    const colorTable = Object.values(CATEGORY_COLORS).map(color => {
      const rgb = hexToRgb(color.bg);
      return rgb ? `\\red${rgb.r}\\green${rgb.g}\\blue${rgb.b}` : '';
    });

    const rtfHeader = `{\\rtf1\\ansi\\ansicpg936\\cocoartf2639
{\\fonttbl\\f0\\fnil\\fcharset134 PingFangSC-Regular;\\f1\\fnil\\fcharset134 PingFangSC-Medium;}
{\\colortbl;\\red0\\green0\\blue0;
\\red0\\green77\\blue100;
${colorTable.join(';\n')};} 
\\viewkind0
\\pard\\pardirnatural\\partightenfactor0\\wrapdefault

\\f0\\fs24 \\cf1 `;

    const rtfContent = content
      .split('\n')
      .map(line => {
        const categoryMatch = line.match(/_\s+(\S+)\s+_/);
        if (categoryMatch) {
          const category = categoryMatch[1];
          const colorIndex = Object.keys(CATEGORY_COLORS).indexOf(category) + 3; // +3 因为前面有两个基础颜色
          const prefix = '_    ';
          const suffix = '  _';
          const categoryText = category.split('').map(char => {
            const code = char.charCodeAt(0);
            return code > 127 ? `\\uc0\\u${code}\\~\\~` : char;
          }).join('');
          return `{\\f1\\fs26\\cf2\\cb${colorIndex}\\b ${prefix}${categoryText}${suffix}\\b0\\cb1}\\par`;
        }
        
        return `\\f0 ${line
          .split('')
          .map(char => {
            const code = char.charCodeAt(0);
            if (code > 127) {
              return `\\uc0\\u${code} `;
            }
            if (char === '\\' || char === '{' || char === '}') {
              return '\\' + char;
            }
            return char;
          })
          .join('')}\\par`;
      })
      .join('\n');

    const rtfFooter = "}";
    const rtfDocument = `${rtfHeader}${rtfContent}${rtfFooter}`;

    const blob = new Blob([rtfDocument], { 
      type: 'application/rtf; charset=utf-8' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const now = new Date();
    const fileName = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${type === 'execution' ? '执行大盘' : '规划大盘'}.rtf`;
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={onToggle}
        >
          快速复制
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            variant="outlined"
          >
            复制
          </Button>
          <Button
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportRTF}
            variant="outlined"
          >
            导出RTF
          </Button>
        </Stack>
      </Stack>

      <Collapse in={expanded}>
        <pre 
          style={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            marginTop: '1rem',
            fontFamily: 'monospace'
          }}
        >
          {getFormattedContent()}
        </pre>
      </Collapse>
    </Paper>
  );
};

export default QuickCopy; 
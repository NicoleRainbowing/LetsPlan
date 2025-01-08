import { Holiday, getHolidayData } from './holidayData';

// 缓存当前年份的节假日数据
let currentYearHolidays: Holiday[] = [];
let currentYear: number = new Date().getFullYear();

// 更新节假日数据
const updateHolidayData = async (year: number) => {
  if (year !== currentYear || currentYearHolidays.length === 0) {
    currentYearHolidays = await getHolidayData(year);
    currentYear = year;
  }
};

export const isHoliday = async (date: Date): Promise<{ isHoliday: boolean; holidayName?: string }> => {
  const year = date.getFullYear();
  await updateHolidayData(year);

  const dateStr = date.toISOString().split('T')[0];
  const holiday = currentYearHolidays.find(h => h.date === dateStr);
  
  if (!holiday) {
    const dayOfWeek = date.getDay();
    return {
      isHoliday: dayOfWeek === 0 || dayOfWeek === 6,
    };
  }

  return {
    isHoliday: !holiday.isWorkday,
    holidayName: holiday.name
  };
};

export const getNextWorkday = async (date: Date): Promise<Date> => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while ((await isHoliday(nextDay)).isHoliday) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};

export const getWorkdaysUntil = async (startDate: Date, endDate: Date): Promise<number> => {
  let workdays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (!(await isHoliday(currentDate)).isHoliday) {
      workdays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workdays;
};

export const formatHolidayInfo = async (date: Date): Promise<string> => {
  const { isHoliday: isHol, holidayName } = await isHoliday(date);
  if (!isHol) return '';
  
  if (holidayName) {
    return `${holidayName}假期`;
  }
  
  return date.getDay() === 0 ? '周日' : '周六';
}; 
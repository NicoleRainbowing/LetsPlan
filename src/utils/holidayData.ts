export interface Holiday {
  name: string;
  date: string;
  isWorkday?: boolean;
}

export interface YearHolidays {
  year: number;
  holidays: Holiday[];
}

// 节假日数据存储
const HOLIDAY_DATA: Record<number, Holiday[]> = {
  2024: [
    // ... 2024年的节假日数据
  ],
  2025: [
    // 预留2025年的数据结构
  ]
};

// 从远程获取节假日数据
const fetchHolidayData = async (year: number): Promise<Holiday[]> => {
  try {
    const response = await fetch(`https://your-api.com/holidays/${year}`);
    if (!response.ok) throw new Error('Failed to fetch holiday data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching holiday data:', error);
    return [];
  }
};

// 本地存储键
const HOLIDAY_STORAGE_KEY = 'holiday_data';
const LAST_UPDATE_KEY = 'holiday_last_update';

// 从本地存储获取数据
const getStoredHolidayData = (): Record<number, Holiday[]> => {
  try {
    const stored = localStorage.getItem(HOLIDAY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading holiday data from storage:', error);
    return {};
  }
};

// 保存数据到本地存储
const storeHolidayData = (data: Record<number, Holiday[]>) => {
  try {
    localStorage.setItem(HOLIDAY_STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error storing holiday data:', error);
  }
};

// 检查数据是否需要更新
const needsUpdate = (year: number): boolean => {
  try {
    const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
    if (!lastUpdate) return true;

    const updateDate = new Date(lastUpdate);
    const now = new Date();
    
    // 如果上次更新超过7天，或者是不同的年份，则需要更新
    return (
      now.getTime() - updateDate.getTime() > 7 * 24 * 60 * 60 * 1000 ||
      now.getFullYear() !== updateDate.getFullYear()
    );
  } catch {
    return true;
  }
};

// 获取指定年份的节假日数据
export const getHolidayData = async (year: number): Promise<Holiday[]> => {
  // 首先检查内存中的数据
  if (HOLIDAY_DATA[year] && HOLIDAY_DATA[year].length > 0) {
    return HOLIDAY_DATA[year];
  }

  // 然后检查本地存储
  const storedData = getStoredHolidayData();
  if (storedData[year] && !needsUpdate(year)) {
    HOLIDAY_DATA[year] = storedData[year];
    return storedData[year];
  }

  // 最后尝试从远程获取
  try {
    const remoteData = await fetchHolidayData(year);
    if (remoteData.length > 0) {
      HOLIDAY_DATA[year] = remoteData;
      storeHolidayData(HOLIDAY_DATA);
      return remoteData;
    }
  } catch (error) {
    console.error('Error updating holiday data:', error);
  }

  // 如果都失败了，返回默认数据
  return getDefaultHolidays(year);
};

// 获取默认节假日数据
const getDefaultHolidays = (year: number): Holiday[] => {
  // 根据年份生成基本的节假日数据
  return [
    { name: '元旦', date: `${year}-01-01` },
    { name: '春节', date: `${year}-02-10` }, // 这里需要根据实际情况调整日期
    { name: '清明节', date: `${year}-04-05` },
    { name: '劳动节', date: `${year}-05-01` },
    { name: '端午节', date: `${year}-06-10` }, // 需要根据农历计算
    { name: '中秋节', date: `${year}-09-15` }, // 需要根据农历计算
    { name: '国庆节', date: `${year}-10-01` },
  ];
}; 
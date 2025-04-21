export const transformDataForChart = (bins) => {
  const dateMap = new Map();
  bins.forEach((bin) => {
    bin.data.forEach((reading) => {
      if (!dateMap.has(reading.date)) {
        dateMap.set(reading.date, { date: reading.date });
      }
      dateMap.get(reading.date)[bin.binName] = reading.weight;
    });
  });
  return Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getColorForBin = (binName) => {
  const name = binName.toLowerCase();
  if (name.includes('general') || name.includes('waste') || name.includes('landfill'))
    return '#F43F5E';
  if (name.includes('commingled')) return '#F59E0B';
  if (name.includes('organic')) return '#10B981';
  if (name.includes('paper') || name.includes('cardboard')) return '#3B82F6';
  if (name.includes('glass')) return '#8B5CF6';
  return '#0EA5E9';
};

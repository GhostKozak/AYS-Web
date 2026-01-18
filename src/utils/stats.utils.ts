export const getTopResultsWithOthers = (
  data: { id: string; value: number }[],
  topCount: number = 5,
  othersLabel: string = "Diğerleri"
) => {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  
  if (sorted.length <= topCount) return sorted;

  const topItems = sorted.slice(0, topCount);
  const othersValue = sorted.slice(topCount).reduce((sum, item) => sum + item.value, 0);

  return [...topItems, { id: othersLabel, value: othersValue }];
};
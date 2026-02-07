import { describe, it, expect } from 'vitest';
import { getTopResultsWithOthers } from './stats.utils';

describe('stats.utils', () => {
  const sampleData = [
    { id: 'A', value: 10 },
    { id: 'B', value: 50 },
    { id: 'C', value: 5 },
    { id: 'D', value: 20 },
    { id: 'E', value: 8 },
    { id: 'F', value: 2 },
  ];

  it('verilen limitten az veri varsa hepsini sıralı döndürmeli', () => {
    // TopCount 10 verelim, elimizde 6 veri var. Hepsini büyükten küçüğe vermeli.
    const result = getTopResultsWithOthers(sampleData, 10);
    
    expect(result).toHaveLength(6);
    expect(result[0].id).toBe('B'); // En büyük (50)
    expect(result[5].id).toBe('F'); // En küçük (2)
    // "Diğerleri" olmamalı
    expect(result.some(r => r.id === 'Diğerleri')).toBe(false);
  });

  it('limiti aşan verilerde "Diğerleri" grubu oluşturmalı', () => {
    // Top 3 isteyelim. Beklenti: [B(50), D(20), A(10), Diğerleri(5+8+2=15)]
    const result = getTopResultsWithOthers(sampleData, 3, 'Others');

    expect(result).toHaveLength(4); // 3 tane top + 1 tane others
    expect(result[0].id).toBe('B');
    expect(result[1].id).toBe('D');
    expect(result[2].id).toBe('A');
    
    // Son eleman 'Others' olmalı
    const othersItem = result[3];
    expect(othersItem.id).toBe('Others');
    expect(othersItem.value).toBe(15); // 8 + 5 + 2
  });

  it('boş veri geldiğinde boş dizi döndürmeli', () => {
    expect(getTopResultsWithOthers([], 5)).toEqual([]);
  });
});
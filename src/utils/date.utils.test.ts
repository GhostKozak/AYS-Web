import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getDayName, 
  isSameDay, 
  getLast7Days, 
  getStartOfWeek,
  getEndOfWeek 
} from './date.utils';

describe('date.utils', () => {
  // Testlerden önce zamanı sabit bir tarihe donduralım: 15 Şubat 2024 (Perşembe)
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-15T12:00:00Z'));
  });

  // Testler bitince zamanı normale döndürelim
  afterEach(() => {
    vi.useRealTimers();
  });

  it('getDayName doğru gün ismini döndürmeli', () => {
    const date = new Date('2024-02-15'); // Perşembe
    expect(getDayName(date, 'tr-TR')).toBe('Perşembe');
    expect(getDayName(date, 'en-US')).toBe('Thursday');
  });

  it('isSameDay aynı günleri tanımalı', () => {
    const d1 = new Date('2024-02-15T10:00:00');
    const d2 = new Date('2024-02-15T23:00:00');
    const d3 = new Date('2024-02-16T10:00:00');

    expect(isSameDay(d1, d2)).toBe(true);
    expect(isSameDay(d1, d3)).toBe(false);
  });

  it('getLast7Days son 7 günü (bugün dahil) döndürmeli', () => {
    // 15 Şubat'tayız. Liste [9 Şubat, ..., 15 Şubat] olmalı.
    const days = getLast7Days();

    expect(days).toHaveLength(7); // Hata düzeltme: Döngü 0'dan 6'ya kadar (7 gün)
    expect(days[6].dateStr).toBe('2024-02-15'); // Son eleman bugün
    expect(days[0].dateStr).toBe('2024-02-09'); // İlk eleman 6 gün önce
  });

  it('getStartOfWeek haftanın başını (Pazartesi) bulmalı', () => {
    // 15 Şubat Perşembe -> Haftanın başı 12 Şubat Pazartesi olmalı
    const today = new Date('2024-02-15');
    const start = getStartOfWeek(today);
    
    // Not: JS Date objesinde aylar 0-indexlidir (0 = Ocak, 1 = Şubat)
    expect(start.getDate()).toBe(12);
    expect(start.getDay()).toBe(1); // 1 = Pazartesi
  });
});
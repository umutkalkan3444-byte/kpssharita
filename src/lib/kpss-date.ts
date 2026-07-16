// KPSS Lisans sınav tarihi geri sayımı.
// Varsayılan hedef: 6 Eylül (yıl otomatik hesaplanır — tarih geçtiyse
// bir sonraki yıla kayar).
export function kpssCountdown(now: Date = new Date()): {
  target: Date;
  totalDays: number;
  months: number;
  days: number;
} {
  const year = now.getMonth() > 8 || (now.getMonth() === 8 && now.getDate() > 6)
    ? now.getFullYear() + 1
    : now.getFullYear();
  const target = new Date(year, 8, 6, 9, 0, 0); // Ay: 8 = Eylül
  const ms = target.getTime() - now.getTime();
  const totalDays = Math.max(0, Math.ceil(ms / 86400000));

  // Ay/gün ayrımı
  const cur = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let months = 0;
  const cursor = new Date(cur);
  while (true) {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + 1);
    if (next <= target) {
      months += 1;
      cursor.setTime(next.getTime());
    } else break;
  }
  const days = Math.max(0, Math.ceil((target.getTime() - cursor.getTime()) / 86400000));
  return { target, totalDays, months, days };
}

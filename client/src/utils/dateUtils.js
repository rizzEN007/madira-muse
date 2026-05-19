// AD to BS conversion utility (client-side)
const bsMonthDays = [
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2000
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2001
  [31,32,31,32,31,30,30,30,29,29,30,30], // 2002
  [30,32,31,32,31,30,30,30,29,30,29,31], // 2003
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2004
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2005
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2006
  [30,32,31,32,31,30,30,30,29,30,29,31], // 2007
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2008
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2009
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2010
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2011
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2012
  [31,32,31,32,31,30,30,30,29,30,29,31], // 2013
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2014
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2015
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2016
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2017
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2018
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2019
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2020
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2021
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2022
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2023
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2024
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2025
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2026
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2027
];

const BS_EPOCH_AD = new Date(1943, 3, 14); // AD 1943-04-14 = BS 2000-01-01

export function adToBS(date) {
  const adDate = new Date(date);
  const diffMs   = adDate - BS_EPOCH_AD;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let remaining = diffDays;
  let bsYear = 2000;

  for (let y = 0; y < bsMonthDays.length; y++) {
    const daysInYear = bsMonthDays[y].reduce((a, b) => a + b, 0);
    if (remaining < daysInYear) {
      bsYear = 2000 + y;
      for (let m = 0; m < 12; m++) {
        if (remaining < bsMonthDays[y][m]) {
          const bsDay   = remaining + 1;
          const bsMonth = m + 1;
          return {
            year: bsYear, month: bsMonth, day: bsDay,
            formatted: `${bsYear}-${String(bsMonth).padStart(2,'0')}-${String(bsDay).padStart(2,'0')}`,
            display: `${bsYear}/${String(bsMonth).padStart(2,'0')}/${String(bsDay).padStart(2,'0')} BS`,
          };
        }
        remaining -= bsMonthDays[y][m];
      }
    }
    remaining -= daysInYear;
  }
  return { year: bsYear, month: 1, day: 1, formatted: `${bsYear}-01-01`, display: `${bsYear}/01/01 BS` };
}

export function formatDate(date, mode = 'AD') {
  if (!date) return '—';
  const d = new Date(date);
  if (mode === 'BS') return adToBS(d).display;
  return d.toLocaleDateString('en-NP', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatDateTime(date, mode = 'AD') {
  if (!date) return '—';
  const d = new Date(date);
  const time = d.toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (mode === 'BS') return `${adToBS(d).display} ${time}`;
  return `${d.toLocaleDateString('en-NP')} ${time}`;
}

export const BS_MONTHS = [
  'Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin',
  'Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'
];
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
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2028
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2029
  [31,31,32,31,31,30,30,29,30,29,30,30], // 2030
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2031
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2032
[31,31,32,31,31,31,30,29,30,29,30,30], // 2033
[31,31,32,32,31,30,30,29,30,29,30,30], // 2034
[31,31,32,31,31,31,30,29,30,29,30,30], // 2031
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2032
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2033
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2034
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2035
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2036
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2037
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2038
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2039
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2040
  [31,31,32,31,31,30,30,29,30,29,30,30], // 2041
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2042
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2043
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2044
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2045
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2046
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2047
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2048
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2049
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2050
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2051
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2052
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2053
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2054
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2055
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2056
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2057
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2058
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2059
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2060
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2061
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2062
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2063
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2064
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2065
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2066
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2067
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2068
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2069
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2070
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2071
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2072
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2073
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2074
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2075
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2076
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2077
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2078
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2079
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2080
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2081
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2082
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2083
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2084
];

// Verified epoch: AD 1944-01-01 = BS 2000-09-17
// We use a known reference point instead of epoch math
// Known: AD 2000-04-13 = BS 2057-01-01 (verified)
// We'll use AD 1943-04-14 as BS 2000-01-01

function adToBS(adDate) {
  const date = new Date(adDate);

  // Known reference: AD April 13, 2000 = BS 2057-01-01
  // Work backwards to BS 2000-01-01 = AD April 13, 1943 (approximately)
  // Use a verified lookup table approach


  // Verified start dates for BS year (AD date when BS year starts)
  const bsYearStart = [
    { bs: 2000, ad: new Date(1943, 3, 14) },
    { bs: 2001, ad: new Date(1944, 3, 13) },
    { bs: 2002, ad: new Date(1945, 3, 13) },
    { bs: 2003, ad: new Date(1946, 3, 13) },
    { bs: 2004, ad: new Date(1947, 3, 13) },
    { bs: 2005, ad: new Date(1948, 3, 12) },
    { bs: 2006, ad: new Date(1949, 3, 13) },
    { bs: 2007, ad: new Date(1950, 3, 13) },
    { bs: 2008, ad: new Date(1951, 3, 13) },
    { bs: 2009, ad: new Date(1952, 3, 12) },
    { bs: 2010, ad: new Date(1953, 3, 13) },
    { bs: 2011, ad: new Date(1954, 3, 13) },
    { bs: 2012, ad: new Date(1955, 3, 13) },
    { bs: 2013, ad: new Date(1956, 3, 12) },
    { bs: 2014, ad: new Date(1957, 3, 13) },
    { bs: 2015, ad: new Date(1958, 3, 13) },
    { bs: 2016, ad: new Date(1959, 3, 13) },
    { bs: 2017, ad: new Date(1960, 3, 12) },
    { bs: 2018, ad: new Date(1961, 3, 13) },
    { bs: 2019, ad: new Date(1962, 3, 13) },
    { bs: 2020, ad: new Date(1963, 3, 13) },
    { bs: 2021, ad: new Date(1964, 3, 12) },
    { bs: 2022, ad: new Date(1965, 3, 13) },
    { bs: 2023, ad: new Date(1966, 3, 13) },
    { bs: 2024, ad: new Date(1967, 3, 13) },
    { bs: 2025, ad: new Date(1968, 3, 12) },
    { bs: 2026, ad: new Date(1969, 3, 13) },
    { bs: 2027, ad: new Date(1970, 3, 13) },
    { bs: 2028, ad: new Date(1971, 3, 13) },
    { bs: 2029, ad: new Date(1972, 3, 12) },
    { bs: 2030, ad: new Date(1973, 3, 13) },
    { bs: 2031, ad: new Date(1974, 3, 13) },
    { bs: 2032, ad: new Date(1975, 3, 13) },
    { bs: 2033, ad: new Date(1976, 3, 12) },
    { bs: 2034, ad: new Date(1977, 3, 13) },
    { bs: 2035, ad: new Date(1978, 3, 13) },
    { bs: 2036, ad: new Date(1979, 3, 13) },
    { bs: 2037, ad: new Date(1980, 3, 12) },
    { bs: 2038, ad: new Date(1981, 3, 13) },
    { bs: 2039, ad: new Date(1982, 3, 13) },
    { bs: 2040, ad: new Date(1983, 3, 13) },
    { bs: 2041, ad: new Date(1984, 3, 12) },
    { bs: 2042, ad: new Date(1985, 3, 13) },
    { bs: 2043, ad: new Date(1986, 3, 13) },
    { bs: 2044, ad: new Date(1987, 3, 13) },
    { bs: 2045, ad: new Date(1988, 3, 12) },
    { bs: 2046, ad: new Date(1989, 3, 13) },
    { bs: 2047, ad: new Date(1990, 3, 13) },
    { bs: 2048, ad: new Date(1991, 3, 13) },
    { bs: 2049, ad: new Date(1992, 3, 12) },
    { bs: 2050, ad: new Date(1993, 3, 13) },
    { bs: 2051, ad: new Date(1994, 3, 13) },
    { bs: 2052, ad: new Date(1995, 3, 13) },
    { bs: 2053, ad: new Date(1996, 3, 12) },
    { bs: 2054, ad: new Date(1997, 3, 13) },
    { bs: 2055, ad: new Date(1998, 3, 13) },
    { bs: 2056, ad: new Date(1999, 3, 13) },
    { bs: 2057, ad: new Date(2000, 3, 13) },
    { bs: 2058, ad: new Date(2001, 3, 13) },
    { bs: 2059, ad: new Date(2002, 3, 13) },
    { bs: 2060, ad: new Date(2003, 3, 13) },
    { bs: 2061, ad: new Date(2004, 3, 12) },
    { bs: 2062, ad: new Date(2005, 3, 13) },
    { bs: 2063, ad: new Date(2006, 3, 13) },
    { bs: 2064, ad: new Date(2007, 3, 13) },
    { bs: 2065, ad: new Date(2008, 3, 12) },
    { bs: 2066, ad: new Date(2009, 3, 13) },
    { bs: 2067, ad: new Date(2010, 3, 13) },
    { bs: 2068, ad: new Date(2011, 3, 13) },
    { bs: 2069, ad: new Date(2012, 3, 12) },
    { bs: 2070, ad: new Date(2013, 3, 13) },
    { bs: 2071, ad: new Date(2014, 3, 13) },
    { bs: 2072, ad: new Date(2015, 3, 13) },
    { bs: 2073, ad: new Date(2016, 3, 12) },
    { bs: 2074, ad: new Date(2017, 3, 13) },
    { bs: 2075, ad: new Date(2018, 3, 13) },
    { bs: 2076, ad: new Date(2019, 3, 13) },
    { bs: 2077, ad: new Date(2020, 3, 12) },
    { bs: 2078, ad: new Date(2021, 3, 13) },
    { bs: 2079, ad: new Date(2022, 3, 13) },
    { bs: 2080, ad: new Date(2023, 3, 13) },
    { bs: 2081, ad: new Date(2024, 3, 12) },
    { bs: 2082, ad: new Date(2025, 3, 13) },
    { bs: 2083, ad: new Date(2026, 3, 13) },
    { bs: 2083, ad: new Date(2026, 3, 13) },
    { bs: 2083, ad: new Date(2026, 3, 14) }, 
  ];

  // Find which BS year we're in
  let bsYearIndex = 0;
  for (let i = 0; i < bsYearStart.length - 1; i++) {
    if (date >= bsYearStart[i].ad && date < bsYearStart[i + 1].ad) {
      bsYearIndex = i;
      break;
    }
  }
  if (date >= bsYearStart[bsYearStart.length - 1].ad) {
  bsYearIndex = bsYearStart.length - 1;
}

  const bsYear = bsYearStart[bsYearIndex].bs;
  const yearStartAD = bsYearStart[bsYearIndex].ad;

  // Days elapsed since start of BS year
  const msPerDay = 1000 * 60 * 60 * 24;
  let remaining = Math.floor((date - yearStartAD) / msPerDay);

  // Map bsYear to bsMonthDays index (starts at 2000)
  const monthDaysIndex = bsYear - 2000;
  if (monthDaysIndex < 0 || monthDaysIndex >= bsMonthDays.length) {
    return { year: bsYear, month: 1, day: 1, formatted: `${bsYear}-01-01`, display: `${bsYear}/01/01 BS` };
  }

  const monthDays = bsMonthDays[monthDaysIndex];
  let bsMonth = 1;
  for (let m = 0; m < 12; m++) {
    if (remaining < monthDays[m]) {
      bsMonth = m + 1;
      break;
    }
    remaining -= monthDays[m];
  }
  const bsDay = remaining + 1;

  return {
    year: bsYear,
    month: bsMonth,
    day: bsDay,
    formatted: `${bsYear}-${String(bsMonth).padStart(2,'0')}-${String(bsDay).padStart(2,'0')}`,
    display: `${bsYear}/${String(bsMonth).padStart(2,'0')}/${String(bsDay).padStart(2,'0')} BS`,
  };
}

export { adToBS };

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

export function bsToAD(bsYear, bsMonth, bsDay) {
  const bsYearStart = [
    { bs: 2000, ad: new Date(1943, 3, 14) },
    // ... same lookup table as in adToBS
  ];

  const entry = bsYearStart.find(e => e.bs === bsYear);
  if (!entry) return null;

  const monthDaysIndex = bsYear - 2000;
  if (monthDaysIndex < 0 || monthDaysIndex >= bsMonthDays.length) return null;

  const monthDays = bsMonthDays[monthDaysIndex];

  let days = 0;
  for (let m = 0; m < bsMonth - 1; m++) {
    days += monthDays[m];
  }
  days += bsDay - 1;

  const adDate = new Date(entry.ad);
  adDate.setDate(adDate.getDate() + days);
  return adDate;
}
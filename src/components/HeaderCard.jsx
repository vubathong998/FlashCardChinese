import { useMemo } from 'react';

const LANGUAGE_OPTIONS = {
  chinese: 'Trung',
  vietnamese: 'Việt',
  english: 'Anh',
  pinyin: 'Pinyin'
};

const POINT_OPTIONS = [
  { value: '0', label: 'Tất cả điểm nhớ' },
  { value: '-1', label: '<1' },
  { value: '-3', label: '<3' },
  { value: '-5', label: '<5' },
  { value: '-7', label: '<7' },
  { value: '-9', label: '<9' },
  { value: '1', label: '>1' },
  { value: '3', label: '>3' },
  { value: '5', label: '>5' },
  { value: '7', label: '>7' },
  { value: '9', label: '>9' }
];

export function getRankOptions(data) {
  const ranks = [...new Set(data.map((item) => String(item.rank || '0')).filter(Boolean))];
  return ranks.sort((a, b) => {
    const aNum = Number(a);
    const bNum = Number(b);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
    return a.localeCompare(b);
  });
}

export default function HeaderCard({
  data,
  selectedLanguage,
  onLanguageChange,
  pointFilter,
  onPointFilterChange,
  rankFilter,
  onRankFilterChange,
  isRandom,
  onRandomChange,
  onNavigate
}) {
  const rankOptions = useMemo(() => getRankOptions(data), [data]);

  return (
    <header className="mb-6 rounded-2xl px-4 py-4 md:px-6 border border-slate-200 bg-white/80">
      <div className="flex flex-col md:flex-row md:justify-between gap-2 pb-1">
        <div className="flex gap-1 flex-wrap">
          {Object.entries(LANGUAGE_OPTIONS).map(([lang, label]) => (
            <button
              key={lang}
              type="button"
              className={`header_btn-${lang} cursor-pointer flex-1 md:flex-none px-4 py-2 md:px-5 md:py-2 rounded-xl border text-sm font-semibold transition ${selectedLanguage === lang
                ? 'bg-purple-500 text-white border-purple-500 shadow'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-100'
                }`}
              onClick={() => onLanguageChange(lang)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex justify-between md:block gap-3">
          <select
            value={pointFilter}
            onChange={(event) => onPointFilterChange(event.target.value)}
            className="header_btn-point flex-1 px-3 py-2 md:mx-0 flex-shrink-0 md:px-4 md:py-2 bg-white rounded-xl border border-slate-300 text-sm font-semibold outline-none cursor-pointer"
          >
            {POINT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={rankFilter}
            onChange={(event) => onRankFilterChange(event.target.value)}
            className="header_btn-rank flex-1 px-3 py-2 md:px-4 md:py-2 md:mx-1 bg-white rounded-xl border border-slate-300 text-sm font-semibold outline-none cursor-pointer"
          >
            <option value="0">Tất cả rank</option>
            {rankOptions.map((rank) => {
              if (rank === '0') return null;
              return <option key={rank} value={rank}>{rank}</option>;
            })}
          </select>
        </div>
      </div>

      <div className="flex justify-between mt-2 gap-2">
        <button
          type="button"
          className="header_btn-prev flex items-center justify-center gap-2 px-5 py-2 bg-white rounded-xl shadow text-sm font-semibold hover:bg-blue-100 active:scale-95 border border-slate-200 cursor-pointer!"
          onClick={() => onNavigate(-1)}
        >
          <span>Lùi</span>
        </button>

        <label className="flex items-center justify-center gap-2 h-10 px-3 bg-white rounded-xl shadow cursor-pointer select-none hover:bg-blue-100 border border-slate-200">
          <input
            type="checkbox"
            checked={isRandom}
            onChange={(event) => onRandomChange(event.target.checked)}
            className="header_checkbox_random w-5 h-5 accent-purple-500 cursor-pointer shrink-0"
          />
          <span className="text-sm font-semibold leading-none">Ngẫu nhiên</span>
        </label>

        <button
          type="button"
          className="header_btn-next flex items-center justify-center gap-2 px-5 py-2 bg-white rounded-xl shadow text-sm font-semibold hover:bg-blue-100 active:scale-95 border border-slate-200 cursor-pointer"
          onClick={() => onNavigate(1)}
        >
          <span>Tiến</span>
        </button>
      </div>
    </header>
  );
}

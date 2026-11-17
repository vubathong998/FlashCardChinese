import { useEffect, useMemo, useRef } from 'react';
import { translate, useAppLanguage } from '../utils/appLanguage.js';

const LANGUAGE_OPTIONS = [
  ['chinese', 'chinese'],
  ['vietnamese', 'vietnamese'],
  ['english', 'english'],
  ['pinyin', 'pinyin']
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
  onNavigate,
  onReloadData
}) {
  const rankOptions = useMemo(() => getRankOptions(data), [data]);
  const uiLanguage = useAppLanguage();
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const pointOptions = [
    { value: '0', label: translate(uiLanguage, 'allPoints') },
    { value: '-1', label: '<1' },
    { value: '-2', label: '<2' },
    { value: '-3', label: '<3' },
    { value: '-4', label: '<4' },
    { value: '-5', label: '<5' },
    { value: '-6', label: '<6' },
    { value: '-7', label: '<7' },
    { value: '-8', label: '<8' },
    { value: '-9', label: '<9' },
    { value: '1', label: '>1' },
    { value: '2', label: '>2' },
    { value: '3', label: '>3' },
    { value: '4', label: '>4' },
    { value: '5', label: '>5' },
    { value: '6', label: '>6' },
    { value: '7', label: '>7' },
    { value: '8', label: '>8' },
    { value: '9', label: '>9' }
  ];

  useEffect(() => () => clearTimeout(longPressTimerRef.current), []);

  const handleNextPointerDown = () => {
    clearTimeout(longPressTimerRef.current);
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      onReloadData();
    }, 2000);
  };

  const handleNextPointerEnd = () => {
    clearTimeout(longPressTimerRef.current);
  };

  const handleNextClick = () => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    onNavigate(1);
  };

  return (
    <header className="mb-6 rounded-2xl px-4 py-4 md:px-6 border border-slate-200 bg-white/80">
      <div className="flex flex-col md:flex-row md:justify-between gap-2 pb-1">
        <div className="flex gap-1 flex-wrap">
          {LANGUAGE_OPTIONS.map(([lang, labelKey]) => (
            <button
              key={lang}
              type="button"
              className={`header_btn-${lang} cursor-pointer flex-1 md:flex-none px-4 py-2 md:px-5 md:py-2 rounded-xl border text-sm font-semibold transition ${selectedLanguage === lang
                ? 'bg-purple-500 text-white border-purple-500 shadow'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-100'
                }`}
              onClick={() => onLanguageChange(lang)}
            >
              {translate(uiLanguage, labelKey)}
            </button>
          ))}
        </div>

        <div className="flex justify-between md:block gap-3">
          <select
            value={pointFilter}
            onChange={(event) => onPointFilterChange(event.target.value)}
            className="header_btn-point flex-1 px-3 py-2 md:mx-0 flex-shrink-0 md:px-4 md:py-2 bg-white rounded-xl border border-slate-300 text-sm font-semibold outline-none cursor-pointer"
          >
            {pointOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={rankFilter}
            onChange={(event) => onRankFilterChange(event.target.value)}
            className="header_btn-rank flex-1 px-3 py-2 md:px-4 md:py-2 md:mx-1 bg-white rounded-xl border border-slate-300 text-sm font-semibold outline-none cursor-pointer"
          >
            <option value="0">{translate(uiLanguage, 'allRanks')}</option>
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
          <span>{translate(uiLanguage, 'previous')}</span>
        </button>

        <label className="flex items-center justify-center gap-2 h-10 px-3 bg-white rounded-xl shadow cursor-pointer select-none hover:bg-blue-100 border border-slate-200">
          <input
            type="checkbox"
            checked={isRandom}
            onChange={(event) => onRandomChange(event.target.checked)}
            className="header_checkbox_random w-5 h-5 accent-purple-500 cursor-pointer shrink-0"
          />
          <span className="text-sm font-semibold leading-none">{translate(uiLanguage, 'random')}</span>
        </label>

        <button
          type="button"
          className="header_btn-next flex items-center justify-center gap-2 px-5 py-2 bg-white rounded-xl shadow text-sm font-semibold hover:bg-blue-100 active:scale-95 border border-slate-200 cursor-pointer"
          onPointerDown={handleNextPointerDown}
          onPointerUp={handleNextPointerEnd}
          onPointerLeave={handleNextPointerEnd}
          onPointerCancel={handleNextPointerEnd}
          onContextMenu={(event) => event.preventDefault()}
          onClick={handleNextClick}
        >
          <span>{translate(uiLanguage, 'next')}</span>
        </button>
      </div>
    </header>
  );
}

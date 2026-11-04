import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const LANGUAGE_CONFIG = {
  chinese: { main: 'chinese', first: 'vietnamese', second: 'pinyin', third: 'english' },
  vietnamese: { main: 'vietnamese', first: 'chinese', second: 'pinyin', third: 'english' },
  english: { main: 'english', first: 'chinese', second: 'pinyin', third: 'vietnamese' },
  pinyin: { main: 'pinyin', first: 'chinese', second: 'english', third: 'vietnamese' }
};

const POINT_OPTIONS = [
  { value: '0', label: 'All' },
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

function shuffleRandomIndex(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function mapper(dataMapper) {
  return dataMapper.map((row, index) => ({
    id: row[0],
    coreIndex: index,
    randomIndex: index,
    point: Number(row[1]),
    chinese: row[2],
    classifier: row[3],
    pinyin: row[4],
    classPinin: row[5],
    english: row[6],
    vietnamese: row[7],
    type: row[8],
    example: row[9],
    category: row[10],
    rank: row[11]
  }));
}

function matchPoint(pointValue, filterValue) {
  if (!filterValue || filterValue === '0') return true;
  const pointNum = Number(pointValue);
  const filterNum = Number(filterValue);
  if (Number.isNaN(pointNum) || Number.isNaN(filterNum)) return false;
  if (filterValue.startsWith('-')) {
    return pointNum <= Math.abs(filterNum);
  }
  return pointNum >= filterNum;
}

function getFieldValue(item, field) {
  switch (field) {
    case 'chinese':
      return item.chinese || '';
    case 'vietnamese':
      return item.vietnamese || '';
    case 'english':
      return item.english || '';
    case 'pinyin':
      return `${item.pinyin || ''}${item.classPinin && item.classPinin.trim() !== '-' && item.classPinin !== '—' ? ` (${item.classPinin})` : ''}`.trim();
    default:
      return '';
  }
}

export default function FlashcardPage() {
  const [dataMapped, setDataMapped] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('chinese');
  const [rankFilter, setRankFilter] = useState('0');
  const [pointFilter, setPointFilter] = useState('0');
  const [isRandom, setIsRandom] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('flashcardSettings') || '{}');
      return Boolean(saved.random);
    } catch {
      return false;
    }
  });
  const [currentPos, setCurrentPos] = useState(0);
  const [isShown, setIsShown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rankOptions, setRankOptions] = useState([]);

  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/1C_JtpNZzgy0iFdmt8oPAunVPQnihENhSIsD2L7H2Wd0/export?format=csv')
      .then((res) => res.text())
      .then((csv) => {
        const rows = csv.trim().split('\n').map((row) => row.split(','));
        const [, ...data] = rows;
        const mapped = mapper(data).filter((item) => item.chinese && item.chinese.trim() !== '');
        const ranks = [...new Set(mapped.map((item) => String(item.rank || '0')).filter(Boolean))];
        ranks.sort((a, b) => {
          const aNum = Number(a);
          const bNum = Number(b);
          if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
          return a.localeCompare(b);
        });

        const saved = JSON.parse(localStorage.getItem('flashcardSettings') || '{}');
        const validSavedRank = ranks.includes(String(saved.rank)) ? saved.rank : '0';

        setDataMapped(mapped);
        setRankOptions(ranks);
        setRankFilter(validSavedRank);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Sheet error:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('flashcardSettings', JSON.stringify({ rank: rankFilter, random: isRandom }));
    } catch {
      // ignore storage issues
    }
  }, [rankFilter, isRandom]);

  const dataFiltered = useMemo(() => {
    if (!dataMapped.length) return [];

    let result = [...dataMapped];

    if (isRandom) {
      result = shuffleRandomIndex(result);
    } else {
      result.sort((a, b) => (a.coreIndex || 0) - (b.coreIndex || 0));
    }

    result = result.filter((item) => {
      const rankMatch = rankFilter === '0' ? item.rank !== 'test' : String(item.rank) === String(rankFilter);
      const pointMatch = matchPoint(item.point, pointFilter);
      const hasChineseMatch = item.chinese && item.chinese.trim() !== '';
      return rankMatch && pointMatch && hasChineseMatch;
    });

    return result;
  }, [dataMapped, isRandom, rankFilter, pointFilter]);

  useEffect(() => {
    if (dataFiltered.length === 0) return;
    setCurrentPos((prev) => Math.min(prev, dataFiltered.length - 1));
  }, [dataFiltered.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.code === 'ArrowUp' || event.code === 'ArrowDown' || event.key === 'f' || event.key === 'F') {
        setIsShown((prev) => !prev);
      }

      if ((event.ctrlKey && event.code === 'Space') || event.key === 'ArrowLeft') {
        event.preventDefault();
        navigate(-1);
      }

      if (event.key === ' ' || event.code === 'Space' || event.key === 'ArrowRight') {
        event.preventDefault();
        navigate(1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dataFiltered.length, currentPos]);

  useEffect(() => {
    const handleWheel = (event) => {
      if (event.deltaY < 0) {
        navigate(-1);
      } else if (event.deltaY > 0) {
        navigate(1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [dataFiltered.length, currentPos]);

  const navigate = (delta) => {
    if (dataFiltered.length === 0) return;
    let nextPos = currentPos + delta;
    if (nextPos < 0) nextPos = dataFiltered.length - 1;
    if (nextPos >= dataFiltered.length) nextPos = 0;
    setCurrentPos(nextPos);
    setIsShown(false);
  };

  const currentItem = dataFiltered[currentPos] ?? null;
  const currentConfig = LANGUAGE_CONFIG[selectedLanguage];

  const renderValue = (fieldKey) => {
    if (!currentItem) return 'No data';
    if (!isShown) return '****';
    return getFieldValue(currentItem, fieldKey);
  };

  const showAllText = () => {
    if (!currentItem) return 'Trống-None-无内容';
    const classifier = currentItem.classifier && currentItem.classifier.trim() !== '-' && currentItem.classifier.trim() !== '—'
      ? currentItem.classifier
      : 'Trống-None-无内容';
    const classPinin = currentItem.classPinin && currentItem.classPinin.trim() !== '-' && currentItem.classPinin.trim() !== '—'
      ? currentItem.classPinin
      : 'Trống-None-无内容';
    const category = currentItem.category && currentItem.category.trim() !== '-' && currentItem.category.trim() !== '—'
      ? currentItem.category
      : 'Trống-None-无内容';
    const rank = currentItem.rank && currentItem.rank.toString().trim() !== '-' && currentItem.rank.toString().trim() !== '—'
      ? currentItem.rank
      : 'Trống-None-无内容';
    return `${classifier} | ${classPinin} | ${category} | ${rank}`;
  };

  return (
    <div className="soft-bg-page min-h-screen flex justify-center p-4 md:p-6">
      <div className="w-full max-w-5xl">
        <header className="mb-6 rounded-2xl px-4 py-4 md:px-6 border border-slate-200 bg-white/80 shadow-sm">
          <div className="flex flex-col md:flex-row md:justify-between gap-2 pb-1">
            <div className="flex gap-1 flex-wrap">
              {Object.entries({ chinese: '中文', vietnamese: '越南文', english: '英文', pinyin: 'Pinyin' }).map(([lang, label]) => (
                <button
                  key={lang}
                  type="button"
                  className={`header_btn-${lang} flex-1 md:flex-none px-4 py-2 md:px-5 md:py-2 rounded-xl border text-sm font-semibold transition ${
                    selectedLanguage === lang
                      ? 'bg-purple-500 text-white border-purple-500 shadow'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-100'
                  }`}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex justify-between md:block gap-3">
              <select
                value={pointFilter}
                onChange={(event) => setPointFilter(event.target.value)}
                className="header_btn-point flex-1 px-3 py-2 md:mx-0 flex-shrink-0 md:px-4 md:py-2 bg-white rounded-xl border border-slate-300 text-sm font-semibold outline-none cursor-pointer"
              >
                {POINT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={rankFilter}
                onChange={(event) => setRankFilter(event.target.value)}
                className="header_btn-rank flex-1 px-3 py-2 md:px-4 md:py-2 bg-white rounded-xl border border-slate-300 text-sm font-semibold outline-none cursor-pointer"
              >
                <option value="0">All</option>
                {rankOptions.map((rank) => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-2 gap-2">
            <button
              type="button"
              className="header_btn-prev flex-1 flex items-center justify-center gap-2 px-5 py-2 bg-white rounded-xl shadow text-sm font-semibold hover:bg-blue-100 active:scale-95 border border-slate-200"
              onClick={() => navigate(-1)}
            >
              <span>下一页</span>
            </button>

            <label className="flex items-center justify-center gap-2 h-10 px-3 bg-white rounded-xl shadow cursor-pointer select-none hover:bg-blue-100 border border-slate-200">
              <input
                type="checkbox"
                checked={isRandom}
                onChange={(event) => setIsRandom(event.target.checked)}
                className="header_checkbox_random w-5 h-5 accent-purple-500 cursor-pointer shrink-0"
              />
              <span className="text-sm font-semibold leading-none">随机Suíjī</span>
            </label>

            <button
              type="button"
              className="header_btn-next flex-1 flex items-center justify-center gap-2 px-5 py-2 bg-white rounded-xl shadow text-sm font-semibold hover:bg-blue-100 active:scale-95 border border-slate-200"
              onClick={() => navigate(1)}
            >
              <span>上一页</span>
            </button>
          </div>
        </header>

        <main className="space-y-4 max-w-4xl mx-auto" onContextMenu={(event) => { event.preventDefault(); setIsShown((prev) => !prev); }}>
          <div
            className="soft-bg-animate bg-white rounded-2xl border border-slate-200 py-6 text-center cursor-pointer"
            onClick={() => setIsShown((prev) => !prev)}
          >
            <span className="body_block-main_show text-5xl sm:text-5xl md:text-3xl font-semibold text-slate-700">
              {currentItem ? getFieldValue(currentItem, currentConfig.main) : 'No data'}
            </span>
          </div>

          <div
            className="soft-bg-animate bg-white rounded-2xl border border-slate-200 py-4 px-6 text-center cursor-pointer"
            onClick={() => setIsShown((prev) => !prev)}
          >
            <span className="body_block-first text-5xl sm:text-4xl md:text-3xl italic text-slate-600">
              {renderValue(currentConfig.first)}
            </span>
          </div>

          <div
            className="soft-bg-animate bg-white rounded-2xl border border-slate-200 py-4 px-6 text-center cursor-pointer"
            onClick={() => setIsShown((prev) => !prev)}
          >
            <span className="body_block-second text-3xl sm:text-2xl md:text-base italic text-slate-600">
              {renderValue(currentConfig.second)}
            </span>
          </div>

          <div
            className="soft-bg-animate bg-white rounded-2xl border border-slate-200 py-4 px-6 text-center cursor-pointer"
            onClick={() => setIsShown((prev) => !prev)}
          >
            <span className="body_block-third text-3xl sm:text-2xl md:text-base italic text-slate-600">
              {renderValue(currentConfig.third)}
            </span>
          </div>

          <div
            className="soft-bg-animate bg-white rounded-2xl border border-slate-200 py-4 px-6 text-center cursor-pointer"
            onClick={() => setIsShown((prev) => !prev)}
          >
            <span className="body_block-example text-3xl sm:text-2xl md:text-base italic text-slate-600">
              {currentItem ? (isShown ? currentItem.example || 'Trống-None-无内容' : '****') : 'No data'}
            </span>
          </div>

          <div
            className="soft-bg-animate bg-white rounded-2xl border border-slate-200 py-4 px-6 text-center cursor-pointer"
            onClick={() => setIsShown((prev) => !prev)}
          >
            <span className="body_block-showAll text-3xl sm:text-2xl md:text-base italic text-slate-600">
              {currentItem ? (isShown ? showAllText() : '****') : 'No data'}
            </span>
          </div>
        </main>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-block text-sm text-slate-500 hover:underline">← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}

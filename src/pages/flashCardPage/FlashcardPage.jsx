import { useEffect, useMemo, useRef, useState } from 'react';
import Loading from '../../components/Loading.jsx';
import HeaderCard, { getRankOptions } from '../../components/HeaderCard.jsx';
import CardComponent from './CardComponent.jsx';

import { Link } from 'react-router-dom';

const LANGUAGE_CONFIG = {
  chinese: { main: 'chinese', first: 'vietnamese', second: 'pinyin', third: 'english' },
  vietnamese: { main: 'vietnamese', first: 'chinese', second: 'pinyin', third: 'english' },
  english: { main: 'english', first: 'chinese', second: 'pinyin', third: 'vietnamese' },
  pinyin: { main: 'pinyin', first: 'chinese', second: 'english', third: 'vietnamese' }
};

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
  const touchStartRef = useRef(null);
  const suppressClickUntilRef = useRef(0);

  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/1C_JtpNZzgy0iFdmt8oPAunVPQnihENhSIsD2L7H2Wd0/export?format=csv')
      .then((res) => res.text())
      .then((csv) => {
        const rows = csv.trim().split('\n').map((row) => row.split(','));
        const [, ...data] = rows;
        const mapped = mapper(data).filter((item) => item.chinese && item.chinese.trim() !== '');
        const ranks = getRankOptions(mapped);

        const saved = JSON.parse(localStorage.getItem('flashcardSettings') || '{}');
        const validSavedRank = ranks.includes(String(saved.rank)) ? saved.rank : '0';

        setDataMapped(mapped);
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

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
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

  const handleContentToggle = (event) => {
    event.stopPropagation();
    if (Date.now() < suppressClickUntilRef.current) return;

    if (window.innerWidth <= 768) {
      setIsShown((prev) => !prev);
    }
  };

  const handleTouchStart = (event) => {
    if (event.touches.length !== 1) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;

    if (!start || !touch || window.innerWidth > 768) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) <= 50 || Math.abs(dx) <= Math.abs(dy)) return;

    suppressClickUntilRef.current = Date.now() + 500;
    navigate(dx < 0 ? 1 : -1);
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
        <HeaderCard
          data={dataMapped}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          pointFilter={pointFilter}
          onPointFilterChange={setPointFilter}
          rankFilter={rankFilter}
          onRankFilterChange={setRankFilter}
          isRandom={isRandom}
          onRandomChange={setIsRandom}
          onNavigate={navigate}
        />

        <main
          className="space-y-4 max-w-4xl mx-auto select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {loading ? (
            <Loading text="Đang tải chữ tầu, vui lòng đợi tí..." />
          ) : (
            <>
              <CardComponent
                className="py-6"
                textClassName="body_block-main_show text-5xl sm:text-5xl md:text-3xl font-semibold text-slate-700 select-text"
                text={currentItem ? getFieldValue(currentItem, currentConfig.main) : 'No data'}
                onClick={handleContentToggle}
              />

              <CardComponent
                className="py-4 px-6"
                textClassName="body_block-first text-5xl sm:text-4xl md:text-3xl italic text-slate-600"
                text={renderValue(currentConfig.first)}
                onClick={handleContentToggle}
              />

              <CardComponent
                className="py-4 px-6"
                textClassName="body_block-second text-3xl sm:text-2xl md:text-base italic text-slate-600"
                text={renderValue(currentConfig.second)}
                onClick={handleContentToggle}
              />

              <CardComponent
                className="py-4 px-6"
                textClassName="body_block-third text-3xl sm:text-2xl md:text-base italic text-slate-600"
                text={renderValue(currentConfig.third)}
                onClick={handleContentToggle}
              />

              <CardComponent
                className="py-4 px-6"
                textClassName="body_block-example text-3xl sm:text-2xl md:text-base italic text-slate-600"
                text={currentItem ? (isShown ? currentItem.example || 'Trống-None-无内容' : '****') : 'No data'}
                onClick={handleContentToggle}
              />

              <CardComponent
                className="py-4 px-6"
                textClassName="body_block-showAll text-3xl sm:text-2xl md:text-base italic text-slate-600"
                text={currentItem ? (isShown ? showAllText() : '****') : 'No data'}
                onClick={handleContentToggle}
              />
            </>
          )}
        </main>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-block text-sm text-slate-500 hover:underline">← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}

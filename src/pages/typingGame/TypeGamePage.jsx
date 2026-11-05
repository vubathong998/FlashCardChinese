import { useEffect, useMemo, useState } from 'react';
import HeaderCard from '../../components/HeaderCard.jsx';
import Loading from '../../components/Loading.jsx';
import CardComponent from '../flashCardPage/CardComponent.jsx';

import { Link } from 'react-router-dom';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1C_JtpNZzgy0iFdmt8oPAunVPQnihENhSIsD2L7H2Wd0/export?format=csv';

const LANGUAGE_FIELDS = {
    chinese: 'chinese',
    vietnamese: 'vietnamese',
    english: 'english',
    pinyin: 'pinyin'
};

function mapSheetData(rows) {
    return rows.map((row, index) => ({
        id: row[0],
        coreIndex: index,
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
    })).filter((item) => item.chinese && item.chinese.trim() !== '');
}

function matchPoint(pointValue, filterValue) {
    if (!filterValue || filterValue === '0') return true;
    const pointNum = Number(pointValue);
    const filterNum = Number(filterValue);
    if (Number.isNaN(pointNum) || Number.isNaN(filterNum)) return false;
    if (filterValue.startsWith('-')) return pointNum <= Math.abs(filterNum);
    return pointNum >= filterNum;
}

function getPrompt(item, language) {
    if (language === 'pinyin') {
        const classPinin = item.classPinin && item.classPinin.trim() !== '-' && item.classPinin !== '—'
            ? ` (${item.classPinin})`
            : '';
        return `${item.pinyin || ''}${classPinin}`.trim();
    }
    return item[LANGUAGE_FIELDS[language]] || '';
}

function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
}

function getDisplayValue(value) {
    return value && value.trim() !== '-' && value.trim() !== '—'
        ? value
        : 'Trống-None-无内容';
}

export default function TypeGamePage() {
    const [data, setData] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('vietnamese');
    const [rankFilter, setRankFilter] = useState('0');
    const [pointFilter, setPointFilter] = useState('0');
    const [isRandom, setIsRandom] = useState(false);
    const [currentPos, setCurrentPos] = useState(0);
    const [answer, setAnswer] = useState('');
    const [answerStatus, setAnswerStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        fetch(SHEET_URL, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Google Sheet request failed: ${response.status}`);
                }
                return response.text();
            })
            .then((csv) => {
                const rows = csv.trim().split('\n').map((row) => row.split(','));
                const [, ...dataRows] = rows;
                setData(mapSheetData(dataRows));
                setLoading(false);
            })
            .catch((error) => {
                if (error.name === 'AbortError') return;
                console.error('Sheet error:', error);
                setLoadError('Không thể tải dữ liệu từ Google Sheet. Vui lòng thử tải lại trang.');
                setLoading(false);
            });

        return () => controller.abort();
    }, []);

    const filteredData = useMemo(() => {
        let result = [...data];

        if (isRandom) {
            result = shuffle(result);
        } else {
            result.sort((a, b) => a.coreIndex - b.coreIndex);
        }

        return result.filter((item) => {
            const rankMatches = rankFilter === '0' ? item.rank !== 'test' : String(item.rank) === String(rankFilter);
            return rankMatches && matchPoint(item.point, pointFilter);
        });
    }, [data, isRandom, pointFilter, rankFilter]);

    useEffect(() => {
        setCurrentPos(0);
        setAnswer('');
        setAnswerStatus('');
    }, [filteredData]);

    const currentItem = filteredData[currentPos] ?? null;

    const navigate = (delta) => {
        if (filteredData.length === 0) return;
        setCurrentPos((position) => (position + delta + filteredData.length) % filteredData.length);
        setAnswer('');
        setAnswerStatus('');
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        setAnswer('');
        setAnswerStatus('');
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!currentItem) return;

        if (answerStatus === 'correct' || answerStatus === 'revealed') {
            navigate(1);
            return;
        }

        const isCorrect = answer.trim().normalize('NFC') === currentItem.chinese.trim().normalize('NFC');
        setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    };

    const handleRevealAnswer = () => {
        if (currentItem) setAnswerStatus('revealed');
    };

    const handleShortcut = (event) => {
        if (event.key === 'Tab' || event.key === '`' || event.code === 'Backquote') {
            event.preventDefault();
            handleRevealAnswer();
        }
    };

    const fullDetails = currentItem
        ? [
            ['Tiếng Trung', currentItem.chinese],
            ['Phân loại', currentItem.classifier],
            ['Pinyin', [currentItem.pinyin, currentItem.classPinin].filter(Boolean).join(' ')],
            ['Tiếng Việt', currentItem.vietnamese],
            ['Tiếng Anh', currentItem.english],
            ['Loại từ', currentItem.type],
            ['Ví dụ', currentItem.example],
            ['Chủ đề', currentItem.category],
            ['Rank', currentItem.rank]
        ]
        : [];

    return (
        <div className="soft-bg-page min-h-screen flex justify-center p-4 md:p-6">
            <div className="w-full max-w-5xl">
                <HeaderCard
                    data={data}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={handleLanguageChange}
                    pointFilter={pointFilter}
                    onPointFilterChange={setPointFilter}
                    rankFilter={rankFilter}
                    onRankFilterChange={setRankFilter}
                    isRandom={isRandom}
                    onRandomChange={setIsRandom}
                    onNavigate={navigate}
                />

                <main className="space-y-4 max-w-4xl mx-auto" onKeyDown={handleShortcut}>
                    {loading ? (
                        <Loading text="Đang tải dữ liệu, vui lòng đợi..." />
                    ) : loadError ? (
                        <div role="alert" className="rounded-2xl border border-red-300 bg-white p-6 text-center text-red-700">
                            {loadError}
                        </div>
                    ) : currentItem ? (
                        <>
                            {selectedLanguage === 'chinese' && (
                                <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 text-center font-medium text-amber-800">
                                    Phần này đang phát triển chưa sử dụng được.
                                </div>
                            )}

                            <CardComponent
                                className="py-6 px-6"
                                textClassName="text-4xl sm:text-5xl font-semibold text-slate-700"
                                text={getPrompt(currentItem, selectedLanguage) || 'Trống-None-无内容'}
                            />

                            <CardComponent
                                className="px-5 py-3"
                                textClassName="text-base sm:text-lg italic text-slate-500"
                                text={`Ví dụ: ${getDisplayValue(currentItem.example)}`}
                            />

                            <form className="space-y-3" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(event) => {
                                        setAnswer(event.target.value);
                                        if (answerStatus !== 'correct') setAnswerStatus('');
                                    }}
                                    placeholder="Nhập chữ tiếng Trung..."
                                    aria-label="Nhập chữ tiếng Trung"
                                    aria-invalid={answerStatus === 'incorrect'}
                                    aria-describedby="typing-answer-status"
                                    className={`w-full rounded-2xl border-2 bg-white px-5 py-4 text-2xl text-slate-800 outline-none transition focus:ring-2 focus:ring-purple-200 ${answerStatus === 'incorrect'
                                        ? 'border-red-500'
                                        : answerStatus === 'correct'
                                            ? 'border-green-500'
                                            : 'border-slate-200 focus:border-purple-400'
                                        }`}
                                />

                                <div className="flex flex-col items-center gap-3">
                                    <p
                                        id="typing-answer-status"
                                        aria-live="polite"
                                        className={`min-h-6 font-semibold ${answerStatus === 'incorrect'
                                            ? 'text-red-600'
                                            : answerStatus === 'correct' || answerStatus === 'revealed'
                                                ? 'text-green-600'
                                                : 'text-transparent'
                                            }`}
                                    >
                                        {answerStatus === 'incorrect'
                                            ? 'Chưa đúng, hãy thử lại.'
                                            : answerStatus === 'correct'
                                                ? 'Chính xác!'
                                                : answerStatus === 'revealed'
                                                    ? 'Đã hiển thị đáp án.'
                                                    : ' '}
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleRevealAnswer}
                                            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 shadow transition hover:bg-slate-100 active:scale-95"
                                        >
                                            Chịu, k biết
                                        </button>
                                        <button
                                            type="submit"
                                            className="rounded-xl bg-purple-500 px-8 py-3 font-semibold text-white shadow transition hover:bg-purple-600 active:scale-95"
                                        >
                                            {answerStatus === 'correct' || answerStatus === 'revealed' ? 'Tiếp tục' : 'Kiểm tra'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {(answerStatus === 'correct' || answerStatus === 'revealed') && (
                                <section aria-label="Thông tin từ vựng" className="space-y-3">
                                    {fullDetails.map(([label, value]) => (
                                        <CardComponent
                                            key={label}
                                            className="px-5 py-4"
                                            textClassName="text-lg text-slate-700"
                                            text={`${label}: ${getDisplayValue(value)}`}
                                        />
                                    ))}
                                </section>
                            )}
                        </>
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">
                            Không có từ phù hợp với bộ lọc đã chọn.
                        </div>
                    )}
                </main>

                <div className="mt-6 text-center">
                    <Link to="/" className="inline-block text-sm text-slate-500 hover:underline">← Về trang chủ</Link>
                </div>
            </div>
        </div>
    );
}

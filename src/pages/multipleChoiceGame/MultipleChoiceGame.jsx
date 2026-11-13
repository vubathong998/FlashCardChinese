import { useCallback, useEffect, useMemo, useState } from 'react';
import CardComponent from '../flashCardPage/CardComponent.jsx';
import HeaderCard, { getRankOptions } from '../../components/HeaderCard.jsx';
import Loading from '../../components/Loading.jsx';
import { readGameSettings, saveGameSettings } from '../../utils/gameSettings.js';
import { translate, useAppLanguage } from '../../utils/appLanguage.js';
import { getSheetCsv } from '../../utils/sheetData.js';

const SETTINGS_KEY = 'multipleChoiceGameSettings';

const LANGUAGE_CONFIG = {
    chinese: { prompt: 'chinese', answer: 'vietnamese', first: 'vietnamese', second: 'pinyin', third: 'english' },
    vietnamese: { prompt: 'vietnamese', answer: 'chinese', first: 'chinese', second: 'pinyin', third: 'english' },
    english: { prompt: 'english', answer: 'chinese', first: 'chinese', second: 'pinyin', third: 'vietnamese' },
    pinyin: { prompt: 'pinyin', answer: 'chinese', first: 'chinese', second: 'english', third: 'vietnamese' }
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

function getFieldValue(item, field) {
    if (field === 'pinyin') {
        const classPinin = item.classPinin && item.classPinin.trim() !== '-' && item.classPinin.trim() !== '—'
            ? ` (${item.classPinin})`
            : '';
        return `${item.pinyin || ''}${classPinin}`.trim();
    }
    return item[field] || '';
}

function getDisplayValue(value) {
    return value && value.trim() !== '-' && value.trim() !== '—'
        ? value
        : 'Trống-None-无内容';
}

function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
}

function getChoices(item, data, answerField) {
    if (!item) return [];
    const answer = getFieldValue(item, answerField);
    if (!answer.trim()) return [];

    const sameRank = data.filter((candidate) =>
        String(candidate.rank || '0') === String(item.rank || '0')
        && candidate.coreIndex !== item.coreIndex
    );
    const distractors = [];
    const seen = new Set([answer.trim()]);

    for (const candidate of shuffle(sameRank)) {
        const text = getFieldValue(candidate, answerField).trim();
        if (!text || seen.has(text)) continue;
        seen.add(text);
        distractors.push({ id: candidate.coreIndex, text });
        if (distractors.length === 3) break;
    }

    return shuffle([
        { id: item.coreIndex, text: answer },
        ...distractors
    ]);
}

function getMetadata(item) {
    return [item.classifier, item.classPinin, item.category, item.rank]
        .map(getDisplayValue)
        .join(' | ');
}

export default function MultipleChoiceGame() {
    const appLanguage = useAppLanguage();
    const [data, setData] = useState([]);
    const [savedSettings] = useState(() => readGameSettings(SETTINGS_KEY));
    const [selectedLanguage, setSelectedLanguage] = useState('chinese');
    const [rankFilter, setRankFilter] = useState(() => typeof savedSettings.rank === 'string' ? savedSettings.rank : '0');
    const [pointFilter, setPointFilter] = useState(() => typeof savedSettings.point === 'string' ? savedSettings.point : '0');
    const [isRandom, setIsRandom] = useState(() => savedSettings.random === true);
    const [currentPos, setCurrentPos] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [answerStatus, setAnswerStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let isActive = true;

        getSheetCsv()
            .then((csv) => {
                const rows = csv.trim().split('\n').map((row) => row.split(','));
                const [, ...dataRows] = rows;
                const mapped = mapSheetData(dataRows);
                const ranks = getRankOptions(mapped);
                const validSavedRank = ranks.includes(String(savedSettings.rank)) ? savedSettings.rank : '0';
                if (!isActive) return;
                setData(mapped);
                setRankFilter(validSavedRank);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Sheet error:', error);
                if (!isActive) return;
                setLoadError(translate(appLanguage, 'loadingError'));
                setLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, [savedSettings]);

    useEffect(() => {
        saveGameSettings(SETTINGS_KEY, { rank: rankFilter, point: pointFilter, random: isRandom });
    }, [rankFilter, pointFilter, isRandom]);

    const questionPool = useMemo(() => {
        let result = data.filter((item) => {
            const rankMatches = rankFilter === '0' ? item.rank !== 'test' : String(item.rank) === String(rankFilter);
            return rankMatches && matchPoint(item.point, pointFilter);
        });

        return isRandom
            ? shuffle(result)
            : result.sort((a, b) => a.coreIndex - b.coreIndex);
    }, [data, isRandom, pointFilter, rankFilter]);

    const filteredData = useMemo(() => {
        const result = questionPool;
        const { prompt, answer } = LANGUAGE_CONFIG[selectedLanguage];
        return result.filter((item) => {
            const hasPrompt = getFieldValue(item, prompt).trim();
            const answerText = getFieldValue(item, answer).trim();
            if (!hasPrompt || !answerText) return false;

            const rankItems = result.filter((candidate) =>
                String(candidate.rank || '0') === String(item.rank || '0')
                && candidate.coreIndex !== item.coreIndex
            );
            const uniqueDistractors = new Set(
                rankItems.map((candidate) => getFieldValue(candidate, answer).trim()).filter(Boolean)
            );
            uniqueDistractors.delete(answerText);
            return uniqueDistractors.size >= 3;
        });
    }, [questionPool, selectedLanguage]);

    useEffect(() => {
        setCurrentPos(0);
        setSelectedChoice(null);
        setAnswerStatus('');
    }, [filteredData]);

    const currentItem = filteredData[currentPos] ?? null;
    const config = LANGUAGE_CONFIG[selectedLanguage];
    const choices = useMemo(
        () => getChoices(currentItem, questionPool, config.answer),
        [currentItem, questionPool, config.answer]
    );

    const navigate = useCallback((delta) => {
        if (filteredData.length === 0) return;
        setCurrentPos((position) => (position + delta + filteredData.length) % filteredData.length);
        setSelectedChoice(null);
        setAnswerStatus('');
    }, [filteredData.length]);

    const revealAnswer = useCallback(() => {
        if (currentItem) setAnswerStatus('revealed');
    }, [currentItem]);

    const checkAnswer = useCallback(() => {
        if (!currentItem) return;
        if (answerStatus === 'correct' || answerStatus === 'revealed') {
            navigate(1);
            return;
        }
        if (selectedChoice === null) return;
        setAnswerStatus(selectedChoice === currentItem.coreIndex ? 'correct' : 'incorrect');
    }, [answerStatus, currentItem, navigate, selectedChoice]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            const target = event.target;
            const isFormControl = target instanceof HTMLElement
                && (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName));

            if (/^[1-4]$/.test(event.key) && !answerStatus) {
                event.preventDefault();
                const choice = choices[Number(event.key) - 1];
                if (choice) setSelectedChoice(choice.id);
            } else if (event.key === 'Tab' || event.key === '`' || event.code === 'Backquote') {
                event.preventDefault();
                revealAnswer();
            } else if (event.key === 'Enter' && !isFormControl) {
                event.preventDefault();
                checkAnswer();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [answerStatus, choices, checkAnswer, revealAnswer]);

    const isRevealed = answerStatus === 'correct' || answerStatus === 'revealed';
    const details = currentItem
        ? [
            [getLanguageLabel(config.prompt, appLanguage), getFieldValue(currentItem, config.prompt)],
            [getLanguageLabel(config.first, appLanguage), getFieldValue(currentItem, config.first)],
            [getLanguageLabel(config.second, appLanguage), getFieldValue(currentItem, config.second)],
            [getLanguageLabel(config.third, appLanguage), getFieldValue(currentItem, config.third)],
            [translate(appLanguage, 'example'), currentItem.example],
            [translate(appLanguage, 'metadata'), getMetadata(currentItem)]
        ]
        : [];

    return (
        <div className="soft-bg-page min-h-screen flex justify-center p-4 md:p-6">
            <div className="w-full max-w-5xl">
                <HeaderCard
                    data={data}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={(language) => {
                        setSelectedLanguage(language);
                        setCurrentPos(0);
                        setSelectedChoice(null);
                        setAnswerStatus('');
                    }}
                    pointFilter={pointFilter}
                    onPointFilterChange={setPointFilter}
                    rankFilter={rankFilter}
                    onRankFilterChange={setRankFilter}
                    isRandom={isRandom}
                    onRandomChange={setIsRandom}
                    onNavigate={navigate}
                />

                <main className="space-y-4 max-w-4xl mx-auto">
                    {loading ? (
                        <Loading text={translate(appLanguage, 'loading')} />
                    ) : loadError ? (
                        <div role="alert" className="rounded-2xl border border-red-300 bg-white p-6 text-center text-red-700">
                            {loadError}
                        </div>
                    ) : currentItem ? (
                        <>
                            <CardComponent
                                className="py-6 px-6"
                                textClassName="text-4xl sm:text-5xl font-semibold text-slate-700"
                                text={getFieldValue(currentItem, config.prompt)}
                            />

                            {!isRevealed && (
                                <div role="group" aria-label={translate(appLanguage, 'chooseAnswer')} className="grid gap-3">
                                    {choices.map((choice, index) => (
                                        <button
                                            key={`${choice.id}-${index}`}
                                            type="button"
                                            aria-pressed={selectedChoice === choice.id}
                                            onClick={() => {
                                                setSelectedChoice(choice.id);
                                                setAnswerStatus('');
                                            }}
                                            className={`w-full rounded-2xl border px-5 py-4 text-left text-xl font-medium shadow-sm transition active:scale-[0.99] ${
                                                selectedChoice === choice.id
                                                    ? 'border-purple-500 bg-purple-50 text-purple-900'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-blue-50'
                                            }`}
                                        >
                                            <span className="mr-3 font-semibold text-slate-400">{index + 1}.</span>
                                            {choice.text}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <p
                                role="status"
                                aria-live="polite"
                                className={`min-h-6 text-center font-semibold ${
                                    answerStatus === 'incorrect'
                                        ? 'text-red-600'
                                        : isRevealed
                                            ? 'text-green-600'
                                            : 'text-transparent'
                                }`}
                            >
                                {answerStatus === 'incorrect'
                                    ? translate(appLanguage, 'incorrect')
                                    : answerStatus === 'correct'
                                        ? translate(appLanguage, 'correct')
                                        : answerStatus === 'revealed'
                                            ? translate(appLanguage, 'revealed')
                                            : ' '}
                            </p>

                            <div className="flex flex-wrap justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={revealAnswer}
                                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 shadow transition hover:bg-slate-100 active:scale-95"
                                >
                                    {translate(appLanguage, 'dontKnowAnswer')}
                                </button>
                                <button
                                    type="button"
                                    onClick={checkAnswer}
                                    disabled={!isRevealed && selectedChoice === null}
                                    className="rounded-xl bg-purple-500 px-8 py-3 font-semibold text-white shadow transition hover:bg-purple-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isRevealed
                                        ? translate(appLanguage, 'continue')
                                        : translate(appLanguage, 'check')}
                                </button>
                            </div>

                            {isRevealed && (
                                <section aria-label={translate(appLanguage, 'details')} className="space-y-3">
                                    {details.map(([label, value]) => (
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
                            {translate(appLanguage, 'insufficientChoices')}
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}

function getLanguageLabel(field, language) {
    return translate(language, field);
}
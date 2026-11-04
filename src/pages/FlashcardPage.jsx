import { useState } from 'react';
import { Link } from 'react-router-dom';
import wordsData from '../FakeData/words.json';
import CardItem from '../components/CardItem';

export default function FlashcardPage() {
    const [mode, setMode] = useState('zh'); // 'zh', 'vi', 'en', 'pinyin'
    const [isRandom, setIsRandom] = useState(false);

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col items-center py-6 px-4">
            {/* Nút về trang chủ */}
            <div className="w-full max-w-2xl mb-4">
                <Link to="/" className="text-sm text-slate-500 hover:underline">← Thoát về trang chủ</Link>
            </div>

            {/* Control Bar Top */}
            <div className="w-full max-w-2xl bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('zh')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'zh' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                        中文
                    </button>
                    <button
                        onClick={() => setMode('vi')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'vi' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                        越南文
                    </button>
                    <button
                        onClick={() => setMode('en')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'en' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                        英文
                    </button>
                    <button
                        onClick={() => setMode('pinyin')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'pinyin' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                        Pinyin
                    </button>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        checked={isRandom}
                        onChange={(e) => setIsRandom(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    随机 Suíjī
                </label>
            </div>

            {/* Danh sách các thẻ từ */}
            <div className="w-full flex flex-col items-center">
                {wordsData.map((word) => (
                    <CardItem key={word.id} word={word} activeMode={mode} />
                ))}
            </div>
        </div>
    );
}
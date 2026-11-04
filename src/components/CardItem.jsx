import { useState } from 'react';

export default function CardItem({ word, activeMode }) {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div
            onClick={() => setIsRevealed(!isRevealed)}
            className="w-full max-w-2xl bg-white p-4 my-2 rounded-xl border border-slate-200 shadow-sm text-center cursor-pointer hover:shadow-md transition min-h-[60px] flex items-center justify-center"
        >
            <div className="text-xl font-medium text-slate-800">
                {/* Hiển thị mặt chính theo chế độ đang chọn */}
                {activeMode === 'zh' && word.zh}
                {activeMode === 'vi' && word.vi}
                {activeMode === 'en' && word.en}
                {activeMode === 'pinyin' && word.pinyin}

                {/* Nội dung ẩn/hiện khi click */}
                {isRevealed ? (
                    <div className="text-sm text-purple-600 mt-1 font-normal">
                        {word.zh} | {word.pinyin} | {word.vi}
                    </div>
                ) : (
                    <div className="text-slate-400 font-mono mt-1">****</div>
                )}
            </div>
        </div>
    );
}
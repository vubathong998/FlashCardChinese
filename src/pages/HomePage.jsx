import { Link } from 'react-router-dom';
import { translate, useAppLanguage } from '../utils/appLanguage.js';

export default function HomePage() {
    const languageCode = useAppLanguage();

    const menuItems = [
        {
            title: languageCode === 'VI' ? 'Xem CV Online' : '在线简历 (CV)',
            to: `/cv-online`,
        },
        {
            title: translate(languageCode, 'openFlashcards'),
            to: `/myflashcard/${languageCode}`,
        },
        {
            title: translate(languageCode, 'openTyping'),
            to: `/typegame/${languageCode}`,
        },
        {
            title: translate(languageCode, 'openQuiz'),
            to: `/multiplechoicegame/${languageCode}`,
        },

    ];

    return (
        <div className="min-h-[calc(100vh-70px)] bg-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
            <div className="text-center max-w-xl mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                    {translate(languageCode, 'welcome')}
                </h1>
                <p className="text-slate-500 text-sm sm:text-base">
                    {translate(languageCode, 'websiteDescription')}
                </p>
            </div>

            <div className="w-full max-w-md space-y-3">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.to}
                        className="flex items-center justify-between w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 text-sm font-medium transition-colors"
                    >
                        <span>{item.title}</span>
                        <span className="text-slate-400">→</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
import { Link } from 'react-router-dom';
import { translate, useAppLanguage } from '../utils/appLanguage.js';

export default function HomePage() {
    const languageCode = useAppLanguage();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">{translate(languageCode, 'welcome')}</h1>
            <p className="text-slate-600 mb-6">{translate(languageCode, 'websiteDescription')}</p>

            <Link
                to={`/myflashcard/${languageCode}`}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl shadow-md hover:bg-purple-700 transition"
            >
                {translate(languageCode, 'openFlashcards')}
            </Link>
            <Link
                to={`/typegame/${languageCode}`}
                className="px-6 py-3 m-4 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition"
            >
                {translate(languageCode, 'openTyping')}
            </Link>
            <Link
                to={`/multiplechoicegame/${languageCode}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
            >
                {translate(languageCode, 'openQuiz')}
            </Link>
        </div>
    );
}
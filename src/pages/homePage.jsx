import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Chào mừng đến với Vũ Bá Thông Website</h1>
            <p className="text-slate-600 mb-6">Trang web tổng hợp công cụ và ứng dụng cá nhân.</p>

            <Link
                to="/myflashcard"
                className="px-6 py-3 bg-purple-600 text-white rounded-xl shadow-md hover:bg-purple-700 transition"
            >
                Vào ứng dụng Học Từ Vựng (Flashcard) →
            </Link>
        </div>
    );
}
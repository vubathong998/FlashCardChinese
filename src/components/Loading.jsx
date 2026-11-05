export default ({ text = "Đang tải..." }) => {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white text-slate-600"
        >
            <span
                aria-hidden="true"
                className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-500"
            />
            <span className="text-sm font-semibold">{text}</span>
        </div>)
}


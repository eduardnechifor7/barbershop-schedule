

export function ErrorScreen({ errorText = "Failed to load your page", onRetry }) {
    return (
        <div className="min-h-screen bg-[#121212] flex flex-col justify-center items-center p-6 text-center">
            <p className="text-[#F2EFE9] font-medium mb-2">Something went wrong</p>
            <p className="text-gray-400 text-sm mb-4">{errorText}</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-[#DBB668] text-[#121212] font-semibold text-sm rounded-xl cursor-pointer"
            >
                Retry
            </button>
        </div>
    );
}
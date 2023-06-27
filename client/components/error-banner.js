const ErrorBanner = ({ children }) => {
    return (
        <div className="bg-red-200 text-red-500 px-3 py-2 rounded font-semibold border border-red-300 first-letter:capitalize">
            {children}
        </div>
    );
};

export default ErrorBanner;

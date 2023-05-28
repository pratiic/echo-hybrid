import SearchBar from "./search-bar.js";

const GenericSearch = ({
    show,
    placeholder,
    resultsLength,
    resultType,
    value = "",
    onChange,
    onSubmit,
    clearSearch,
}) => {
    return (
        <div>
            <SearchBar
                show={show}
                placeholder={placeholder}
                value={value}
                focusOnLoad={false}
                onChange={onChange}
                onSubmit={onSubmit}
                clearSearch={clearSearch}
            />

            {resultsLength > 0 && (
                <p className="ml-7 dark-light mt-1">
                    <span className="font-semibold">{resultsLength}</span>{" "}
                    {resultType} found
                </p>
            )}
        </div>
    );
};

export default GenericSearch;

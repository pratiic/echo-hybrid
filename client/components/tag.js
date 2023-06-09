const Tag = ({ text }) => {
    return (
        <div className="bg-blue-50 w-fit rounded-full dark-light px-2 py-[4px] text-xs mt-2 capitalize dark:bg-gray-800">
            {text}
        </div>
    );
};

export default Tag;

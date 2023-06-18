const StatCard = ({ title, stat }) => {
    return (
        <div className="bg-gray-50 w-fit px-3 py-2 rounded-xl shadow dark-light">
            <h3 className="text-xl font-semibold capitalize">{title}</h3>

            <div>
                {Object.keys(stat).map((prop) => {
                    return (
                        <div className="flex flex-col justify-center items-center">
                            <span className={`text-lg font-semibold`}>
                                {stat[prop]}
                            </span>
                            <span className="-mt-1 text-sm text-gray-one">
                                {prop}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatCard;

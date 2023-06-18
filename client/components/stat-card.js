const StatCard = ({ title, stat }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl shadow dark-light h-fit">
      <h3 className="text-xl font-semibold capitalize mb-2">{title}</h3>

      <div className="grid grid-cols-3 gap-y-5">
        {Object.keys(stat).map((prop) => {
          return (
            <div className="flex flex-col items-center justify-self-start space-y-[2px]">
              <span className="text-xl font-semibold">{stat[prop]}</span>
              <span className="-mt-1 text-sm first-letter:capitalize">
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

import { PieChart, PieArcSeries } from "reaviz";

const StatCard = ({ title, stat }) => {
  const renderPieChart = (stat) => {
    const data = Object.keys(stat).map((prop) => {
      return { key: prop, data: stat[prop] };
    });

    return (
      <div className="flex align-center">
        <PieChart
          // height={200}
          data={data}
          series={
            <PieArcSeries
              cornerRadius={4}
              padAngle={0.02}
              padRadius={200}
              doughnut={true}
              // colorScheme="blue-four"
            />
          }
        />
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl shadow dark-light h-fit">
      <h3 className="text-lg capitalize mb-2 font-semibold">{title}</h3>
      {renderPieChart(stat)}

      <div className="grid grid-cols-3 gap-y-5">
        {Object.keys(stat).map((prop) => {
          // console.log(stat, prop);
          return (
            <div>
              <div className="flex flex-col items-center justify-self-start space-y-[2px]">
                <span className="text-xl">{stat[prop]}</span>
                <span className="-mt-1 text-sm first-letter:capitalize">
                  {prop}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatCard;

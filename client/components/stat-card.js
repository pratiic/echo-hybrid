import { PieChart, PieArcSeries } from "reaviz";

const StatCard = ({ title, stat }) => {
    const renderPieChart = (stat) => {
        const data = Object.keys(stat)
            .filter((prop) => prop !== "total")
            .map((prop) => {
                return { key: prop, data: stat[prop] };
            });

        return (
            <div className="flex align-center">
                <PieChart
                    height={200}
                    data={data}
                    series={
                        <PieArcSeries
                            cornerRadius={4}
                            padAngle={0.02}
                            padRadius={200}
                            doughnut={true}
                            colorScheme="cybertron"
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

            {stat.total && (
                <div>
                    <span className="text-sm">Total - </span>
                    <span>{stat["total"]}</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;

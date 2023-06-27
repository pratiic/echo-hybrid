const StockInfo = () => {
    const stockTypes = [
        {
            title: "flat",
            description: "Flat stock only has the quantity of a product.",
        },
        {
            title: "varied",
            description:
                "Varied stock defines different variations of a product based on attributes such as color, size, etc. Each variant type has its own values, for e.g. color may have red, blue. Quantity can be defined for each combination of variants.",
        },
    ];

    const InfoItem = ({ title, description }) => {
        return (
            <li className="mb-3">
                <h4 className="capitalize text-lg font-semibold black-white">
                    {title}
                </h4>
                <p className="dark-light">{description}</p>
            </li>
        );
    };

    return (
        <div className="max-w-[300px]">
            <h3 className="heading-generic-modal">Product stock types</h3>

            <ul className="-mt-1">
                {stockTypes.map((stockType, index) => {
                    return (
                        <InfoItem
                            title={stockType.title}
                            description={stockType.description}
                            key={index}
                        />
                    );
                })}
            </ul>
        </div>
    );
};

export default StockInfo;

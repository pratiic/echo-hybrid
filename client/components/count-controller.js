// shows buttons to increment and decrement the quantity of a product or different variations

const CountController = ({
    count = 1,
    min = 1,
    max,
    setCount,
    setZero,
    userCanBuy,
}) => {
    const handleCountControl = (action) => {
        let newCount;

        if (action === "increment") {
            newCount = count + 1;
            setCount(newCount <= max ? newCount : max);
        } else {
            newCount = count - 1;
            setCount(newCount >= 0 ? newCount : 0);
        }
    };

    return (
        <div className="flex items-center space-x-5">
            <Controller
                disabled={count === min || setZero || !userCanBuy}
                onClick={() => handleCountControl("decrement")}
            >
                -
            </Controller>
            <span className={setZero ? "dark-light" : "black-white"}>
                {setZero ? 0 : count}
            </span>
            <Controller
                disabled={count === max || setZero || !userCanBuy}
                onClick={() => handleCountControl("increment")}
            >
                +
            </Controller>
        </div>
    );
};

function Controller({ disabled, children, onClick }) {
    return (
        <button
            className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 px-3 py-[3px] text-xl dark-light rounded hover:bg-gray-200 dark:hover:bg-gray-800 hover:black-white active:bg-gray-100 dark:active:bg-gray-700 active:dark-light transition-all duration-200 ${disabled &&
                "opacity-50 pointer-events-none"}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default CountController;

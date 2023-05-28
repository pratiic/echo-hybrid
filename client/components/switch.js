import { useSound } from "use-sound";

import { capitalizeFirstLetter } from "../lib/strings";

const Switch = ({ label, switchedOn, onToggle }) => {
    const [play] = useSound("/sounds/toggle.mp3", { volume: 0.5 });

    const toggleSwitch = () => {
        onToggle(!switchedOn);
        play();
    };

    return (
        <div className="flex items-center">
            {label && (
                <label className="dark-light ml-1 mr-3">
                    {capitalizeFirstLetter(label)}
                </label>
            )}

            <div
                className={`flex items-center h-[20px] w-[35px] relative rounded-full cursor-pointer transition-all duration-200 ${
                    switchedOn ? "bg-blue-three" : "bg-gray-400"
                }`}
                onClick={toggleSwitch}
            >
                <div
                    className={`h-[18px] w-[18px] rounded-full transition-transform duration-200 ${
                        switchedOn
                            ? "bg-white translate-x-[16px]"
                            : "bg-gray-two translate-x-[1px]"
                    }`}
                ></div>
            </div>
        </div>
    );
};

export default Switch;

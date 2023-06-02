import React, { useState, useEffect } from "react";

const OrderTimeline = ({ status, isDelivered }) => {
    const states =
        status === "REJECTED"
            ? [
                  {
                      label: "PLACED",
                  },
                  {
                      label: "REJECTED",
                  },
              ]
            : status === "CANCELLED"
            ? [
                  {
                      label: "PLACED",
                  },
                  {
                      label: "CANCELLED",
                  },
              ]
            : [
                  {
                      label: "PLACED",
                  },
                  {
                      label: "CONFIRMED",
                  },
                  {
                      label: "PACKAGED",
                  },
                  {
                      label: isDelivered ? "DELIVERED" : "COMPLETED",
                  },
              ];

    const [currentStateIndex, setCurrentStateIndex] = useState(0);

    useEffect(() => {
        setCurrentStateIndex(
            states.findIndex((state) => state.label === status)
        );
    }, [status, states]);

    const getBgColor = (index, forPath = false) => {
        // for dot
        if (
            states[index].label === "REJECTED" ||
            states[index].label === "CANCELLED"
        ) {
            return "bg-red-400";
        }

        // path's bg
        if (forPath) {
            if (
                states[index + 1].label === "REJECTED" ||
                states[index + 1].label === "CANCELLED"
            ) {
                return "bg-red-400";
            }
        }

        if (forPath) {
            // path's blue bg

            if (index < currentStateIndex) {
                return "bg-blue-three";
            }
        } else {
            // dot's blue-bg

            if (index <= currentStateIndex) {
                return "bg-blue-three";
            }
        }

        return "bg-gray-400";
    };

    return (
        <div className="flex mt-12 mx-auto 500:mx-5 w-fit">
            {states.map((state, index) => {
                return (
                    <div
                        className="flex flex-col justify-center items-center mr-[70px] 450:mr-20 relative last:mr-0"
                        key={index}
                    >
                        <label className="absolute -top-[1.35rem] text-xs capitalize">
                            {state.label.toLowerCase()}
                        </label>
                        <span
                            className={`relative block h-3 w-3 rounded-full z-[2] ${getBgColor(
                                index
                            )}`}
                        ></span>
                        {index < states.length - 1 && (
                            <div
                                className={`absolute left-full -ml-1 w-[5rem] 450:w-[5.5rem] h-[0.125rem] z-[1] ${getBgColor(
                                    index,
                                    true
                                )}`}
                            ></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default OrderTimeline;

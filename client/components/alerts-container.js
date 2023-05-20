import React from "react";
import { useSelector } from "react-redux";

import Alert from "./alert";

const AlertsContainer = () => {
  const { alerts } = useSelector((state) => state.alerts);

  return (
    <div className="fixed right-2 bottom-2 400:right-3 400:bottom-3 650:right-4 650:bottom-4 z-40">
      {alerts.map((alert, i) => {
        return (
          <Alert
            id={i}
            message={alert.message}
            type={alert.type}
            active={alert.active}
            key={i}
          />
        );
      })}
    </div>
  );
};

export default AlertsContainer;

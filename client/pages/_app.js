import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../redux/store";

import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
    const [showChildren, setShowChildren] = useState(false);

    useEffect(() => {
        setShowChildren(true);
    }, []);

    if (!showChildren) {
        return null;
    }

    if (typeof window === "undefined") {
        return <></>;
    }

    return (
        <Provider store={store}>
            <Component {...pageProps} />
        </Provider>
    );
}

export default MyApp;

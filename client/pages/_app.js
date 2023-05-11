import { useState, useEffect } from "react";

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

    return <Component {...pageProps} />;
}

export default MyApp;

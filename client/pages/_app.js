import { useState, useEffect } from "react";
import { Provider } from "react-redux";

import "../styles/globals.css";

import { store } from "../redux/store";

import Layout from "../components/layout";

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
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </Provider>
    );
}

export default MyApp;

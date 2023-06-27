import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";

import { fetcher } from "../../lib/fetcher";
import { setAlert, setErrorAlert } from "../../redux/slices/alerts-slice";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../../redux/slices/modal-slice";
import { updateAuthUser } from "../../redux/slices/auth-slice";

import PageHeader from "../../components/page-header";
import BusinessDetails from "../../components/business-registration/details";
import BusinessPending from "../../components/business-registration/pending";

const BusinessRegistration = () => {
    const [activeView, setActiveView] = useState("");
    const [business, setBusiness] = useState(null);
    const [fetching, setFetching] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();
    const { authUser } = useSelector((state) => state.auth);

    const viewTitleMap = {
        details: "Business registration",
        pending: "Registration pending",
    };

    useEffect(() => {
        if (!authUser?.store) {
            if (!isCancelled) {
                dispatch(
                    setAlert({
                        type: "info",
                        message: "you need to register as a seller first",
                    })
                );
                router.push("/sell-products");
            } else {
                router.push("/products");
            }
        } else {
            fetchUserBusiness();
        }
    }, [authUser, isCancelled]);

    useEffect(() => {
        if (router.query.view) {
            setActiveView(router.query.view);
        } else {
            router.push("/business-registration/?view=details");
        }
    }, [router]);

    useEffect(() => {
        if (business) {
            if (business.isVerified) {
                router.push("/set-product");
            }
        }
    }, [business]);

    const fetchUserBusiness = async () => {
        setFetching(true);

        try {
            const data = await fetcher(`businesses/0/details`);
            setBusiness(data.business);
        } catch (error) {
        } finally {
            setFetching(false);
        }
    };

    const handleCancellation = async (event) => {
        event.preventDefault();

        dispatch(
            showConfirmationModal({
                title: "business registration cancellation",
                message:
                    "are you sure you want to cancel your business registration ?",
                handler: async () => {
                    dispatch(
                        showLoadingModal(
                            "cancelling your business registration..."
                        )
                    );

                    try {
                        await fetcher(`businesses/${business?.id}`, "DELETE");

                        setIsCancelled(true);
                        dispatch(
                            setAlert({
                                type: "success",
                                message:
                                    "your business registration has been cancelled",
                            })
                        );
                        setTimeout(() => {
                            dispatch(
                                updateAuthUser({
                                    store: null,
                                })
                            );
                        }, 100);
                    } catch (error) {
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    if (fetching) {
        return <p className="status">Loading business details...</p>;
    }

    // if (error) {
    //     return <p className="status">{error}</p>;
    // }

    return (
        <section>
            <Head>
                <title>{viewTitleMap[activeView]}</title>
            </Head>

            <PageHeader heading={`${viewTitleMap[activeView]}`} hasBackArrow />

            {activeView === "details" && (
                <BusinessDetails business={business} />
            )}

            {activeView === "pending" && (
                <BusinessPending
                    business={business}
                    handleCancellation={handleCancellation}
                />
            )}
        </section>
    );
};

export default BusinessRegistration;

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";

import PageHeader from "../components/page-header";
import InfoBanner from "../components/info-banner";
import Button from "../components/button";
import { updateAuthUser } from "../redux/slices/auth-slice";

const BusinessPending = () => {
    const [business, setBusiness] = useState(null);
    const [fetching, setFetching] = useState(false);

    const { authUser } = useSelector((state) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (authUser) {
            fetchUserBusiness();
        }
    }, [authUser]);

    useEffect(() => {
        if (business) {
            if (business.isVerified) {
                router.push("/set-product");
            }

            if (!business.address) {
                // not verified, address not set
                router.push("/business-registration/address");
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

    const handleCancelClick = (event) => {
        event.preventDefault();

        dispatch(
            showConfirmationModal({
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

                        dispatch(
                            updateAuthUser({
                                store: {
                                    ...authUser?.store,
                                    business: null,
                                },
                            })
                        );
                        dispatch(
                            setAlert({
                                type: "success",
                                message:
                                    "your business registration has been cancelled",
                            })
                        );
                        router.push("/");
                    } catch (error) {
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    const InfoPair = ({ label, value }) => {
        return (
            <div className="capitalize dark-light border-b w-fit py-2">
                <label className="">{label} </label>
                <span className="font-semibold">{value}</span>
            </div>
        );
    };

    if (fetching) {
        return <p className="status">Loading business details...</p>;
    }

    return (
        <section>
            <PageHeader heading="pending registration" hasBackArrow />

            <InfoBanner>
                <p>
                    Your business registration has been received and is yet to
                    be decided on.
                </p>
                <p>
                    A notification will be sent to you once the admin accepts or
                    rejects your business registration.
                </p>
            </InfoBanner>

            <div className="-mt-2">
                <InfoPair label="legal name" value={business?.name} />
                <InfoPair label="owner" value={business?.ownerName} />
                <InfoPair label="PAN" value={business?.PAN} />
                <InfoPair label="phone" value={business?.phone} />
                <div className="py-2">
                    <label className="capitalize dark-light block mb-2">
                        registration certificate
                    </label>

                    <img
                        className="max-w-[200px]"
                        src={business?.regImage}
                        alt="registration certificate"
                    />
                </div>

                <div className="mt-5">
                    <Button rounded={false} onClick={handleCancelClick}>
                        cancel registration
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default BusinessPending;

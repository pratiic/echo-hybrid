import { useEffect } from "react";
import { useRouter } from "next/router";

import { getAddress } from "../../lib/address";

import InfoBanner from "../info-banner";
import Button from "../button";

const BusinessPending = ({ business, handleCancellation }) => {
    const router = useRouter();

    useEffect(() => {
        if (business) {
            if (business.isVerified) {
                router.push("/set-product");
            }

            if (!business.address) {
                // not verified, address not set
                router.push("/business-registration/?view=address");
            }
        }
    }, [business]);

    const InfoPair = ({ label, value }) => {
        return (
            <div className="capitalize dark-light border-b w-fit py-2">
                <label className="">{label} </label>
                <span className="font-semibold whitespace-pre-wrap">
                    {value}
                </span>
            </div>
        );
    };

    return (
        <section>
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
                <InfoPair
                    label="address"
                    value={getAddress(business?.address, true)}
                />
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
                    <Button rounded={false} onClick={handleCancellation}>
                        cancel registration
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default BusinessPending;

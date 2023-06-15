import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

import { getDate, getHowLongAgo } from "../lib/date-time";

import PageHeader from "../components/page-header";

const Suspended = () => {
    const { authUser } = useSelector((state) => state.auth);

    const router = useRouter();

    useEffect(() => {
        if (!authUser?.suspension) {
            router.push("/");
        }
    }, [authUser]);

    return (
        <section className="dark-light max-w-[700px]">
            <div className="py-2">
                <PageHeader heading="account suspension" />
            </div>

            <div className="space-y-1 -mt-3">
                <p>
                    We regret to inform you that your account on Echo was
                    suspended{" "}
                    {getHowLongAgo(authUser?.suspension?.createdAt, true)} ago
                    on {getDate(authUser?.suspension?.createdAt)}. The reason
                    for suspension:
                </p>
                <p className="font-semibold whitespace-pre-wrap max-w-[500px] first-letter:capitalize">
                    {authUser?.suspension?.cause}
                </p>
                <p>
                    Until this suspension is lifted, you will not be able to
                    access any part of the application, expect for your own
                    profile. To request reinstatement of your account, you can
                    reach out to us at the email address{" "}
                    <span className="font-semibold">
                        pratikbhandari2456@gmail.com
                    </span>
                    . Your user Id is{" "}
                    <span className="font-semibold">{authUser?.id}</span>.
                </p>
            </div>
        </section>
    );
};

export default Suspended;

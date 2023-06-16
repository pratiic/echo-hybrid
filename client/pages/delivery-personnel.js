import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";

import { setDeliveryPersonnelProp } from "../redux/slices/delivery-slice";
import { fetcher } from "../lib/fetcher";
import { showGenericModal } from "../redux/slices/modal-slice";
import { singularOrPlural } from "../lib/strings";

import PageHeader from "../components/page-header";
import ContentList from "../components/content-list";
import PersonnelAdder from "../components/personnel-adder";
import GenericSearch from "../components/generic-search";

const DeliveryPersonnel = () => {
    const {
        personnel: { list: personnelList, loading, error, needToFetch, query },
    } = useSelector((state) => state.delivery);

    const dispatch = useDispatch();

    useEffect(() => {
        if (needToFetch) {
            fetchDeliveryPersonnel();
        }
    }, [needToFetch]);

    const setProp = (prop, value) => {
        dispatch(setDeliveryPersonnelProp({ prop, value }));
    };

    const fetchDeliveryPersonnel = async () => {
        if (loading) {
            return;
        }

        setProp("loading", true);

        try {
            const data = await fetcher(`delivery/personnel/?query=${query}`);

            setProp(
                "list",
                data.personnel.map((personnel) => {
                    return {
                        ...personnel,
                        deliveriesCount: personnel._count.deliveries,
                    };
                })
            );
        } catch (error) {
            setProp("error", error.message);
        } finally {
            setProp("loading", false);
        }
    };

    const handlePersonnelAddition = () => {
        dispatch(showGenericModal(<PersonnelAdder />));
    };

    const renderCountMessage = () => {
        if (query) {
            return (
                <p className="history-message -mt-2">
                    <span className="font-semibold">
                        {personnelList.length}
                    </span>{" "}
                    delivery personnel found
                </p>
            );
        }

        if (personnelList.length === 0) {
            return;
        }

        return (
            <p className="history-message -mt-2">
                There {singularOrPlural(personnelList, "is", "are")}{" "}
                <span className="font-semibold">{personnelList.length}</span>{" "}
                delivery personnel
            </p>
        );
    };

    const renderGenericSearch = () => {
        if (personnelList.length === 0 && !query) {
            return;
        }

        return (
            <div className="mb-5">
                <GenericSearch
                    show={true}
                    placeholder="Search id, name or email..."
                    onSubmit={(query) => setProp("query", query)}
                    clearSearch={() => setProp("query", "")}
                />
            </div>
        );
    };

    return (
        <section>
            <Head>
                <title>Delivery personnel</title>
            </Head>

            <PageHeader
                heading="delivery personnel"
                hasBackArrow
                hasAddBtn
                addToolname="add personnel"
                onAddClick={handlePersonnelAddition}
            />

            {renderCountMessage()}

            {renderGenericSearch()}

            <ContentList
                list={personnelList}
                type="delivery-personnel"
                loadingMsg={loading && "loading delivery personnel..."}
                error={error}
                emptyMsg="there are no delivery personnel"
                human="no-items"
            />
        </section>
    );
};

export default DeliveryPersonnel;

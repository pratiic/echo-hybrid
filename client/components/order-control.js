import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

import { fetcher } from "../lib/fetcher";
import { capitalizeFirstLetter } from "../lib/strings";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
    showGenericModal,
} from "../redux/slices/modal-slice";
import { deleteOrder, updateOrder } from "../redux/slices/orders-slice";
// import { addTransaction } from "../redux/slices/transactions-slice";

import Button from "./button";

const OrderControl = ({
    orderId,
    status,
    origin,
    product,
    // orderCompletion,
    orderType,
    store,
}) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { authUser } = useSelector((state) => state.auth);

    const getStatus = (action) => {
        console.log(action);

        return action === "package" ? "packaged" : `${action}ed`;
    };

    const controlOrder = (event, action) => {
        event.stopPropagation();

        dispatch(
            showConfirmationModal({
                message: `Are you sure you want to ${action} this order?`,
                handler: async () => {
                    dispatch(showLoadingModal(`${action}ing this order...`));

                    try {
                        const data = await fetcher(
                            `orders/${orderId}/?action=${action}`,
                            "PATCH"
                        );

                        if (action === "confirm" || action === "package") {
                            dispatch(
                                updateOrder({
                                    id: orderId,
                                    type: "seller",
                                    updateInfo: { status: data.order.status },
                                })
                            );
                        }

                        if (action === "reject") {
                            dispatch(
                                deleteOrder({ id: orderId, type: "seller" })
                            );
                        }

                        dispatch(
                            setAlert({
                                message: `Order has been ${getStatus(action)}`,
                                type: "success",
                            })
                        );

                        try {
                            fetcher("notifications", "POST", {
                                destinationId: origin.id,
                                text: `Your order of ${capitalizeFirstLetter(
                                    product.name
                                )} has been ${getStatus(action)}`,
                                linkTo: `/orders/?show=user`,
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    } catch (error) {
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    // const handleOrderCompletion = (event, action = "req") => {
    //     event.stopPropagation();

    //     const confirmationMsg = `Are you ${
    //         action === "req"
    //             ? "saying"
    //             : action === "accept"
    //             ? "confirming"
    //             : "denying"
    //     } that this order has been completed ?`;

    //     dispatch(
    //         showConfirmationModal({
    //             message: confirmationMsg,
    //             handler: async () => {
    //                 try {
    //                     dispatch(
    //                         showLoadingModal("processing your request...")
    //                     );

    //                     const data = await fetcher(
    //                         `orders/${orderId}/completion/?action=${action}`, // action not actually need while requesting
    //                         action === "req" ? "POST" : "PATCH"
    //                     );

    //                     let updateInfo = {};
    //                     let notification = {
    //                         destinationId:
    //                             authUser?.id === origin?.id
    //                                 ? store?.userId
    //                                 : origin?.id,
    //                         linkTo: `/orders/?show=${
    //                             authUser?.id === origin?.id ? "seller" : "user"
    //                         }`,
    //                     };

    //                     if (action === "req") {
    //                         updateInfo = {
    //                             orderCompletion: data.request,
    //                         };

    //                         // prepare notification data
    //                         notification.text = `a completion request for the order of - ${product?.name} - has been received`;
    //                     } else {
    //                         if (action === "accept") {
    //                             const transaction = data.transaction;
    //                             updateInfo = {
    //                                 status: "completed",
    //                             };

    //                             //add a new transaction
    //                             dispatch(
    //                                 addTransaction({
    //                                     transaction,
    //                                     type: orderType,
    //                                 })
    //                             );
    //                             // delete the completed order
    //                             dispatch(
    //                                 deleteOrder({
    //                                     type: orderType,
    //                                     id: orderId,
    //                                 })
    //                             );
    //                             // prepare notification data
    //                             notification.text = `your completion request for the order of - ${product?.name} - has been accepted`;
    //                             // override linkTo because order becomes transaction when completed
    //                             notification.linkTo = `/transactions/?show=${
    //                                 authUser?.id === origin?.id
    //                                     ? "seller"
    //                                     : "user"
    //                             }`;

    //                             router.push(`/transactions/?show=${orderType}`);
    //                         } else {
    //                             updateInfo = {
    //                                 orderCompletion: null,
    //                             };
    //                             // prepare notification data
    //                             notification.text = `your completion request for the order of - ${product?.name} - has been rejected`;
    //                         }
    //                     }

    //                     dispatch(
    //                         updateOrder({
    //                             id: orderId,
    //                             type: router.query.show,
    //                             updateInfo,
    //                         })
    //                     );

    //                     dispatch(
    //                         setAlert({
    //                             message:
    //                                 action === "req"
    //                                     ? "order completion request has been made"
    //                                     : `order completion request has been ${action}ed`,
    //                         })
    //                     );

    //                     // send notification
    //                     fetcher("notifications", "POST", notification);
    //                 } catch (error) {
    //                     dispatch(setErrorAlert(error.message));
    //                 } finally {
    //                     dispatch(closeModal());
    //                 }
    //             },
    //         })
    //     );
    // };

    const handleInfoClick = (event) => {
        event.stopPropagation();

        const CompletionInfo = () => {
            return (
                <div>
                    <h3 className="heading-generic-modal">Order completion</h3>

                    <div className="max-w-[350px] dark-light -mt-1">
                        <p>
                            To complete an order, there has to be an agreement
                            from both sides
                        </p>
                        <p>
                            Either the seller or the buyer requests completion,
                            which may be accepted or rejected by the order party
                        </p>
                    </div>
                </div>
            );
        };

        dispatch(showGenericModal(<CompletionInfo />));
    };

    const renderControl = () => {
        if (status === "PLACED") {
            return (
                <React.Fragment>
                    <Button
                        small
                        onClick={(event) => controlOrder(event, "confirm")}
                    >
                        Accept Order
                    </Button>
                    <Button
                        type="tertiary"
                        small
                        onClick={(event) => controlOrder(event, "reject")}
                    >
                        Reject Order
                    </Button>
                </React.Fragment>
            );
        } else if (status === "CONFIRMED") {
            return (
                <Button
                    small
                    onClick={(event) => controlOrder(event, "package")}
                >
                    Set Packaged
                </Button>
            );
        } else if (status === "PACKAGED") {
            // if (orderCompletion) {
            //     return (
            //         <div className="max-w-[300px]">
            //             {orderCompletion.madeById === authUser.id ? (
            //                 <p className="italic">
            //                     Order completion request has been sent, waiting
            //                     confirmation
            //                 </p>
            //             ) : (
            //                 <div>
            //                     <p className="mb-3">
            //                         Order completion request was received. Has
            //                         this order been completed ?
            //                     </p>
            //                     <div className="flex space-x-3">
            //                         <Button
            //                             onClick={(event) =>
            //                                 handleOrderCompletion(
            //                                     event,
            //                                     "accept"
            //                                 )
            //                             }
            //                         >
            //                             yes
            //                         </Button>
            //                         <Button
            //                             type="tertiary"
            //                             onClick={(event) =>
            //                                 handleOrderCompletion(
            //                                     event,
            //                                     "reject"
            //                                 )
            //                             }
            //                         >
            //                             no
            //                         </Button>
            //                     </div>
            //                 </div>
            //             )}
            //         </div>
            //     );
            // }
            // return (
            //     <div className="flex items-center">
            //         <InformationCircleIcon
            //             className="icon mr-3"
            //             onClick={handleInfoClick}
            //         />
            //         <Button
            //             small
            //             onClick={(event) => handleOrderCompletion(event)}
            //         >
            //             request completion
            //         </Button>
            //     </div>
            // );
        }
    };

    return <div className="flex space-x-5 mt-5 text-sm">{renderControl()}</div>;
};

export default OrderControl;

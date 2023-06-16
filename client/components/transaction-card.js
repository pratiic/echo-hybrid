import React, { useEffect, useState } from "react";
import {
  TrashIcon,
  DotsVerticalIcon,
  ChatAlt2Icon,
} from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import { fetcher } from "../lib/fetcher";
import { setAlert, setErrorAlert } from "../redux/slices/alerts-slice";
import {
  closeModal,
  showConfirmationModal,
  showLoadingModal,
} from "../redux/slices/modal-slice";
import { deleteTransaction } from "../redux/slices/transactions-slice";

import OrderHead from "./order-head";
import OrderRest from "./order-rest";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";

const TransactionCard = ({
  id,
  order: {
    product,
    quantity,
    variant,
    origin,
    store,
    address,
    deliveryType,
    deliveryCharge,
    unitPrice,
  },
  createdAt,
}) => {
  const [isUserTransaction, setUserTransaction] = useState(false);
  const [isStoreTransaction, setStoreTransaction] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { authUser } = useSelector((state) => state.auth);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    setUserTransaction(origin?.id === authUser?.id);
    setStoreTransaction(store?.user?.id === authUser?.id);
  }, [origin, store, authUser]);

  const handleTransactionClick = () => {
    router.push(`/products/${product?.id}`);
  };

  const handleTransactionDeletion = (event) => {
    event.stopPropagation();

    dispatch(
      showConfirmationModal({
        message: "Are you sure you want to delete this transaction?",
        handler: async () => {
          dispatch(showLoadingModal("deleting your transaction..."));

          try {
            await fetcher(`transactions/${id}`, "DELETE");
            dispatch(
              deleteTransaction({
                type: isUserTransaction ? "user" : "shop",
                id,
              })
            );
            dispatch(
              setAlert({
                message: "the transaction was deleted",
              })
            );
          } catch (error) {
            dispatch(setErrorAlert(error.message));
          } finally {
            dispatch(closeModal());
          }
        },
      })
    );
  };

  const toggleDropdown = (event) => {
    if (event) {
      event.stopPropagation();
    }

    setShowDropdown(!showDropdown);
  };

  const handleChatClick = (event) => {
    event.stopPropagation();

    router.push(`/chats/${isUserTransaction ? store?.user?.id : origin.id}`);
  };

  return (
    <div className="card-transparent" onClick={handleTransactionClick}>
      <OrderHead product={product} quantity={quantity} variant={variant} />
      <OrderRest
        isSellerItem={isStoreTransaction}
        isUserItem={isUserTransaction}
        user={origin}
        store={store}
        address={address}
        deliveryType={deliveryType}
        deliveryCharge={deliveryCharge}
        unitPrice={unitPrice}
        quantity={quantity}
        createdAt={createdAt}
        itemType="transaction"
      />

      <div className="absolute bottom-0 right-0">
        <DotsVerticalIcon
          className="icon-small"
          onClick={(event) => toggleDropdown(event)}
        />

        <Dropdown
          show={showDropdown}
          toggleDropdown={toggleDropdown}
          position="top"
        >
          <DropdownItem
            icon={<ChatAlt2Icon className="icon-no-bg" />}
            onClick={handleChatClick}
          >
            chat now
          </DropdownItem>
          <DropdownItem action="delete" onClick={handleTransactionDeletion}>
            Delete Transaction
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
};

export default TransactionCard;

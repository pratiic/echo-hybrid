import {
  setError,
  setLoading,
  setLoadingMore,
  setOrders,
} from "../redux/slices/orders-slice";
import {
  setError as setErrorT,
  setLoading as setLoadingT,
  setLoadingMore as setLoadingMoreT,
  setTransactions,
} from "../redux/slices/transactions-slice";
import { monthToNumberMap, months } from "./date-time";
import { fetcher } from "./fetcher";
import { getSubtotal } from "./order";

export const getOrders = async (type, dispatch, page, data) => {
  try {
    await getHistoryItems(
      `orders/?type=${type}`,
      "order",
      type,
      setOrders,
      setLoading,
      setError,
      dispatch,
      page,
      setLoadingMore,
      data
    );
  } catch (error) {
    console.log(error);
  }
};

export const getTransactions = async (type, displayPeriod, dispatch) => {
  let createdMonth,
    createdYear,
    url = `transactions/?type=${type}`;

  if (displayPeriod !== "all") {
    displayPeriod = displayPeriod.split(", ");
    createdMonth = monthToNumberMap[displayPeriod[0]];
    createdYear = parseInt(displayPeriod[1]);
    url += `&month=${createdMonth}&year=${createdYear}`;
  }

  try {
    await getHistoryItems(
      url,
      "transaction",
      type,
      setTransactions,
      setLoadingT,
      setErrorT,
      dispatch,
      setLoadingMoreT
    );
  } catch (error) {
    console.log(error);
  }
};

const getHistoryItems = async (
  url,
  itemType,
  itemOf,
  itemsSetter,
  loadingSetter,
  errorSetter,
  dispatch,
  page,
  loadingMoreSetter,
  existingData = []
) => {
  // itemOf -> user || shop
  // itemType -> order || transactions

  if (page[itemOf] === 1) {
    dispatch(loadingSetter({ type: itemOf, value: true }));
  } else {
    dispatch(loadingMoreSetter({ type: itemOf, loadingMore: true }));
  }

  try {
    if (!itemOf) {
      return;
    }

    const data = await fetcher(url);

    if (page[itemOf] === 1) {
      dispatch(
        itemsSetter({
          [`${itemType}s`]: data[`${itemType}s`],
          type: itemOf,
        })
      );
    } else {
      dispatch(
        itemsSetter({
          [`${itemType}s`]: [...existingData, ...data[`${itemType}s`]],
          type: itemOf,
        })
      );
    }
  } catch (error) {
    dispatch(errorSetter({ error: error.message, type: itemOf }));
  } finally {
    dispatch(loadingSetter({ type: itemOf, value: false }));
    dispatch(loadingMoreSetter({ type: itemOf, value: false }));
    dispatch(errorSetter({ error: "", type: itemOf }));
  }
};

export const getMonthlyTotals = (transactions, periods, year) => {
  if (!year) {
    return [];
  }

  const monthlyTotals = [];

  months.forEach((month) => {
    month = monthToNumberMap[month];
    year = parseInt(year);

    const periodTransactions = transactions.filter(
      (transaction) =>
        transaction.createdMonth == month && transaction.createdYear == year
    );

    let periodTotal = 0;
    periodTransactions.forEach((transaction) => {
      const { unitPrice, quantity, deliveryCharge } = transaction.order;

      periodTotal += getSubtotal(unitPrice, quantity, deliveryCharge, false);
    });

    monthlyTotals.push(periodTotal);
  });

  return monthlyTotals;
};

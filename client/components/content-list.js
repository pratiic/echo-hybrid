import ContentCard from "./content-card";
import Spinner from "./spinner";
import Button from "./button";
import NotificationCard from "./notification-card";
import CartItem from "./cart-item";
import UserCard from "./user-card";
import OrderCard from "./order-card";
import DeliveryCard from "./delivery-card";
import BusinessRequest from "./business-request";
import CategoryRequest from "./category-request";
import ReportCard from "./report-card";
import TransactionCard from "./transaction-card";
import SuspensionCard from "./suspension-card";
import PersonnelCard from "./personnel-card";

import Human from "./human";

const ContentList = ({
    list = [],
    type = "product",
    loadingMsg,
    error,
    emptyMsg,
    human,
    incrementPageNumber,
    loadingMore,
}) => {
    if (loadingMsg) {
        return <p className="status">{loadingMsg}</p>;
    }

    if (error) {
        return <p className="status"> {error} </p>;
    }

    if (list.length === 0) {
        return human ? (
            <Human name={human} message={emptyMsg} />
        ) : (
            <p className="status">{emptyMsg}</p>
        );
    }

    return (
        <div>
            <div
                className={`${(type === "product" ||
                    type === "seller" ||
                    type === "category-request" ||
                    type === "report") &&
                    "grid"} ${
                    type === "product" || type === "seller"
                        ? "grid-cols-list-xs 600:grid-cols-list"
                        : type === "category-request"
                        ? "grid-cols-list-request"
                        : type === "report"
                        ? "grid-cols-list-report"
                        : ""
                } gap-2 600:gap-5 750:gap-7 mb-5`}
            >
                {list.map((content) => {
                    if (type === "product" || type === "seller") {
                        return (
                            <ContentCard
                                {...content}
                                key={content.id}
                                {...{
                                    owner:
                                        type === "seller"
                                            ? content.user
                                            : content.store.user,
                                }}
                                type={type}
                            />
                        );
                    }
                    if (type === "notification") {
                        return (
                            <NotificationCard {...content} key={content.id} />
                        );
                    }
                    if (type === "order") {
                        return <OrderCard {...content} key={content.id} />;
                    }

                    if (type === "user") {
                        return <UserCard {...content} key={content.id} />;
                    }

                    if (type === "transaction") {
                        return (
                            <TransactionCard {...content} key={content.id} />
                        );
                    }

                    if (type === "cart-item") {
                        return <CartItem {...content} key={content.id} />;
                    }

                    if (type === "delivery") {
                        return <DeliveryCard {...content} key={content.id} />;
                    }

                    if (type === "business-request") {
                        return (
                            <BusinessRequest {...content} key={content.id} />
                        );
                    }

                    if (type === "category-request") {
                        return (
                            <CategoryRequest {...content} key={content.id} />
                        );
                    }

                    if (type === "report") {
                        return <ReportCard {...content} key={content.id} />;
                    }

                    if (type === "suspension") {
                        return <SuspensionCard {...content} key={content.id} />;
                    }

                    if (type === "delivery-personnel") {
                        return <PersonnelCard {...content} key={content.id} />;
                    }
                })}
            </div>

            {incrementPageNumber && (
                <div className="w-fit mx-auto mt-7 mb-3 h-[40px]">
                    {loadingMore ? (
                        <Spinner />
                    ) : (
                        <Button
                            type="secondary"
                            small
                            rounded
                            onClick={incrementPageNumber}
                        >
                            load more
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContentList;

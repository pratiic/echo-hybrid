import { useSelector } from "react-redux";

import Avatar from "./avatar";
import { capitalizeFirstLetter } from "../lib/strings";

const UserPreview = ({ user, title, className }) => {
    const { authUser } = useSelector((state) => state.auth);

    return (
        <div className={`flex items-center mb-3 ${className}`}>
            <Avatar avatar={user?.avatar} smaller />

            <div className="flex flex-col ml-2">
                <span className="text-sm">{capitalizeFirstLetter(title)}</span>

                {!user && (
                    <span className="dark-light italic text-sm">
                        user was deleted
                    </span>
                )}

                <span className="black-white capitalize">
                    {user?.id === authUser?.id ? "me" : user?.fullName}
                </span>

                <span className="text-sm">{user?.email}</span>
            </div>
        </div>
    );
};

export default UserPreview;

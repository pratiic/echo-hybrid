import { useSelector } from "react-redux";

import Avatar from "./avatar";

const UserPreview = ({ user, title }) => {
    const { authUser } = useSelector((state) => state.auth);

    return (
        <div className="flex items-center mb-3">
            <Avatar avatar={user?.avatar} smaller />

            <div className="flex flex-col ml-2">
                <span className="text-sm">{title}</span>
                <span className="black-white capitalize">
                    {user?.id === authUser?.id ? "me" : user?.fullName}
                </span>
                <span className="text-sm">{user?.email}</span>
            </div>
        </div>
    );
};

export default UserPreview;

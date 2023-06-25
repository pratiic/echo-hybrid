import { useDispatch, useSelector } from "react-redux";

import { setSidebar } from "../redux/slices/sidebar-slice";

const Overlay = () => {
    const { showSidebar } = useSelector((state) => state.sidebar);

    const dispatch = useDispatch();

    return (
        showSidebar && (
            <div
                className="fixed h-screen w-screen z-10 bg-modal-light dark:bg-modal-dark 1000:hidden"
                onClick={() => dispatch(setSidebar(false))}
            ></div>
        )
    );
};

export default Overlay;

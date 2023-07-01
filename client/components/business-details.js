import { useDispatch } from "react-redux";

import { openGallery } from "../redux/slices/gallery-slice";

import InfoUnit from "./info-unit";

const BusinessDetails = ({ name, PAN, phone, regImage }) => {
    const dispatch = useDispatch();

    const handleImageClick = () => {
        dispatch(openGallery({ images: [regImage] }));
    };

    return (
        <div className="max-w-[300px]">
            <h4 className="modal-title capitalize">{name}</h4>

            <InfoUnit label="PAN" value={PAN} textBlue={false} />
            <InfoUnit label="phone" value={phone} textBlue={false} />
            <div>
                <span className="text-sm dark-light">
                    Registration certificate
                </span>
                <img
                    className="image max-w-full cursor-pointer rounded-lg"
                    src={regImage}
                    alt="registration-certificate"
                    onClick={handleImageClick}
                />
            </div>
        </div>
    );
};

export default BusinessDetails;

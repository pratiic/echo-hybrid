import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";

import { fetcher } from "../../../lib/fetcher";
import { clearErrors, displayError } from "../../../lib/validation";
import { generateFormData } from "../../../lib/form-data";
import { setAlert } from "../../../redux/slices/alerts-slice";

import Button from "../../../components/button";
import PageHeader from "../../../components/page-header";
import Form from "../../../components/form";
import InputGroup from "../../../components/input-group";
import FileSelector from "../../../components/file-selector";

const Details = () => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerNameError, setOwnerNameError] = useState("");
  const [PAN, setPAN] = useState("");
  const [PANError, setPANError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [regImage, setRegImage] = useState(null);
  const [regImageError, setRegImageError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [business, setBusiness] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);

  const { selectedFiles } = useSelector((state) => state.files);
  const { authUser } = useSelector((state) => state.auth);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (authUser) {
      fetchUserBusiness();
    }
  }, [authUser]);

  useEffect(() => {
    if (business) {
      setFieldsDisabled(true);

      if (business.address) {
        // business has already been registered and address has already been set
        router.push("/");
      } else {
        // business has been already registered
        const { name, ownerName, PAN, phone } = business;
        setName(name);
        setOwnerName(ownerName);
        setPAN(PAN);
        setPhone(phone);
      }
    }
  }, [business]);

  useEffect(() => {
    if (selectedFiles.length > 0) {
      setRegImage(selectedFiles[0]);
    }
  }, [selectedFiles]);

  const fetchUserBusiness = async () => {
    setFetching(true);

    try {
      const data = await fetcher(`businesses/0`);
      setBusiness(data.business);
    } catch (error) {
    } finally {
      setFetching(false);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // business registered, address not set and not updating -> simply route to the address set page
    if (business) {
      return router.push("/business-registration/address");
    }

    clearErrors([
      setNameError,
      setOwnerNameError,
      setPANError,
      setPhoneError,
      setRegImageError,
    ]);
    setRegistering(true);

    try {
      const formData = generateFormData({ name, ownerName, PAN, phone });

      if (regImage) {
        formData.append("image", regImage);
      }

      await fetcher("businesses", "POST", formData);

      dispatch(setAlert({ message: "business details has been set" }));

      router.push("/business-registration/address");
    } catch (error) {
      if (error.message.toLowerCase() === "file too large") {
        return setRegImageError(error.message);
      }

      displayError(
        error.message,
        [
          "name",
          "ownerName",
          "PAN",
          "phone",
          "business registration certificate",
        ],
        [
          setNameError,
          setOwnerNameError,
          setPANError,
          setPhoneError,
          setRegImageError,
        ]
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelClick = async (event) => {
    event.preventDefault();

    try {
      await fetcher(`businesses/${business?.id}`, "DELETE");
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section>
      <Head>
        <title>Register business | provide details</title>
      </Head>

      {/* <PageHeader heading="register your business" hasBackArrow /> */}

      <Form heading="Provide business details" onSubmit={handleFormSubmit}>
        <InputGroup
          label="name"
          value={name}
          error={nameError}
          placeholder="legal business name"
          disabled={fieldsDisabled}
          onChange={setName}
        />

        <InputGroup
          label="owner name"
          value={ownerName}
          error={ownerNameError}
          placeholder="legal business owner"
          disabled={fieldsDisabled}
          onChange={setOwnerName}
        />

        <InputGroup
          label="PAN"
          value={PAN}
          error={PANError}
          placeholder="permanent account number"
          disabled={fieldsDisabled}
          onChange={setPAN}
        />

        <InputGroup
          label="phone"
          value={phone}
          error={phoneError}
          placeholder="landline or mobile"
          disabled={fieldsDisabled}
          onChange={setPhone}
        />

        <div className="mt-3">
          <FileSelector
            prevSrc={business?.regImage}
            error={regImageError}
            label="Business Registration Certificate"
            isRequired={true}
            disabled={fieldsDisabled}
          />
        </div>

        <div className="flex items-center justify-between">
          {business && (
            <Button type="secondary" onClick={handleCancelClick}>
              cancel reigstration
            </Button>
          )}
          <Button loading={registering || fetching} full={!business}>
            Continue
          </Button>
        </div>
      </Form>
    </section>
  );
};

export default Details;

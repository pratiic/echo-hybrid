import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSelector } from "react-redux";

import { fetcher } from "../../../lib/fetcher";
import { clearErrors, displayError } from "../../../lib/validation";
import { generateFormData } from "../../../lib/form-data";

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
  const [regImageError, setRegImageError] = useState();

  const { selectedFiles } = useSelector((state) => state.files);

  const router = useRouter();

  useEffect(() => {
    if (selectedFiles.length > 0) {
      setRegImage(selectedFiles[0]);
    }
  }, [selectedFiles]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    clearErrors([
      setNameError,
      setOwnerNameError,
      setPANError,
      setPhoneError,
      setRegImageError,
    ]);

    try {
      const formData = generateFormData({ name, ownerName, PAN, phone });

      if (regImage) {
        formData.append("image", regImage);
      }

      await fetcher("businesses", "POST", formData);

      router.push("/business-registration/address");
    } catch (error) {
      if (error.message.toLowerCase() === "file too large") {
        return setRegImageError(error.message);
      }

      displayError(
        error.message,
        ["name", "owner name", "PAN", "phone"],
        [setNameError, setOwnerNameError, setPANError, setPhoneError]
      );
    }
  };

  return (
    <section>
      <Head>Register Business</Head>

      <PageHeader heading="Register business" hasBackArrow />

      <Form onSubmit={handleFormSubmit} centered={false}>
        <InputGroup
          label="name"
          value={name}
          error={nameError}
          onChange={setName}
        />

        <InputGroup
          label="owner name"
          value={ownerName}
          error={ownerNameError}
          onChange={setOwnerName}
        />

        <InputGroup
          label="PAN"
          value={PAN}
          error={PANError}
          onChange={setPAN}
        />

        <InputGroup
          label="phone"
          value={phone}
          error={phoneError}
          onChange={setPhone}
        />

        <label className="ml-1 block transition-all duration-200 dark-light">
          Business Registration Certificate{" "}
          <span className="ml-1 dark-light">*</span>
        </label>
        <div className="mt-3">
          <FileSelector error={regImageError} />
        </div>

        <Button>Next</Button>
      </Form>
    </section>
  );
};

export default Details;

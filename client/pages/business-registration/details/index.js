import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import Button from "../../../components/button";
import PageHeader from "../../../components/page-header";
import Form from "../../../components/form";
import InputGroup from "../../../components/input-group";
import { fetcher } from "../../../lib/fetcher";
import { clearErrors, displayError } from "../../../lib/validation";
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

  const router = useRouter();

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    console.log("click next");

    clearErrors([setNameError, setOwnerNameError, setPANError, setPhoneError]);

    try {
      const data = await fetcher("businesses", "POST", {
        name,
        ownerName,
        PAN,
        phone,
      });

      console.log(data);

      //  router.push("/business-registration/address");
    } catch (error) {
      console.log(error.message);
      displayError(
        error.message,
        ["name", "owner name", "PAN", "phone"],
        [setNameError, setOwnerNameError, setPANError, setPhoneError]
      );
    }
    //  router.push("/business-registration/address");
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
          <FileSelector />
        </div>

        <Button>Next</Button>
      </Form>
    </section>
  );
};

export default Details;

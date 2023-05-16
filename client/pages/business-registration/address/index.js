import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import { provinceOptions, districtOptions } from "../../../lib/address";
import { clearErrors, displayError } from "../../../lib/validation";
import { fetcher } from "../../../lib/fetcher";

import Form from "../../../components/form";
import InputGroup from "../../../components/input-group";
import Button from "../../../components/button";
import PageHeader from "../../../components/page-header";

const Address = () => {
  const [province, setProvince] = useState("bagmati");
  const [provinceError, setProvinceError] = useState("");
  const [district, setDistrict] = useState("kathmandu");
  const [districtError, setDistrictError] = useState("");
  const [city, setCity] = useState("");
  const [cityError, setCityError] = useState("");
  const [area, setArea] = useState("");
  const [areaError, setAreaError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [requesting, setRequesting] = useState(false);

  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    setRequesting(true);
    clearErrors([
      setProvinceError,
      setDistrictError,
      setCityError,
      setAreaError,
      setDescriptionError,
    ]);

    try {
      await fetcher("addresses/business", "POST", {
        province,
        district,
        city,
        area,
        description,
      });

      router.push("/products");
    } catch (error) {
      displayError(
        error.message,
        ["province", "district", "city", "area", "description"],
        [
          setProvinceError,
          setDistrictError,
          setCityError,
          setAreaError,
          setDescriptionError,
        ]
      );
    } finally {
      setRequesting(false);
    }
  };

  return (
    <section>
      <Head>Register Business</Head>

      <PageHeader heading="Set Address" />

      <Form onSubmit={handleFormSubmit}>
        <InputGroup
          label="province"
          view="select"
          options={provinceOptions}
          value={province}
          error={provinceError}
          onChange={setProvince}
        />

        {province === "bagmati" && (
          <InputGroup
            label="district"
            view="select"
            options={districtOptions}
            value={district}
            error={districtError}
            onChange={setDistrict}
          />
        )}

        <InputGroup
          label="city"
          placeholder="e.g. kathmandu"
          value={city}
          error={cityError}
          onChange={setCity}
        />

        <InputGroup
          label="area"
          placeholder="e.g. koteshwor"
          value={area}
          error={areaError}
          onChange={setArea}
        />

        <InputGroup
          label="description"
          value={description}
          error={descriptionError}
          onChange={setDescription}
          view="textarea"
        />

        {/* change style later */}
        <div className="flex items-center">
          <div className="mr-3">
            <Button onClick={handleBackClick} type="secondary">
              Back
            </Button>
          </div>

          <Button loading={requesting}>
            {requesting ? "requesting" : "request"}
          </Button>
        </div>
      </Form>
    </section>
  );
};

export default Address;

import React from "react";
import Button from "../../../components/button";
import { useRouter } from "next/router";

const Address = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div>
      Address
      <Button onClick={handleBackClick}>Back</Button>
    </div>
  );
};

export default Address;

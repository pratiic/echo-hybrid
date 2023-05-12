export const displayError = (error, fields, setters) => {
  if (!error) {
    return;
  }

  fields.forEach((field, index) => {
    if (error.includes(field) || error.includes(`"${field}"`)) {
      return setters[index](error);
    }
  });
};

export const clearErrors = (setters) => {
  setters.forEach((setter) => setter(""));
};

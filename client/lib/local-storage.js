export const setProp = (prop, val) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(prop, JSON.stringify(val));
  }
};

export const getProp = (prop) => {
  if (typeof window !== "undefined") {
    const val = localStorage.getItem(prop);

    if (val) {
      return JSON.parse(val);
    }
  }
};

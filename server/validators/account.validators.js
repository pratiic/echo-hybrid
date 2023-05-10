export const validateCode = (inputCode, actualCode, createdAt) => {
    // the verification code may be incorrect or expired

    if (inputCode.trim() !== actualCode) {
        return "the verification code is incorrect";
    }

    // check if the code is older than 1 hour
    const validAge = validateAge(createdAt, 1);

    if (!validAge) {
        return `the verification code has expired, each code has an age of 1 hour`;
    }
};

export const validateAge = (createdAt, age) => {
    const currentMilliSecs = Date.now();
    const createdDate = new Date(createdAt);
    const createdAtMilliSecs = createdDate.getTime(createdAt);
    const diffMilliSecs = currentMilliSecs - createdAtMilliSecs;

    if (Math.floor(diffMilliSecs / 1000 / 60 / 60) > age) {
        return false;
    }

    return true;
};

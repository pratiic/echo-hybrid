export const getVerificationCode = () => {
    let code = "";
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";

    for (let i = 1; i <= 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
};

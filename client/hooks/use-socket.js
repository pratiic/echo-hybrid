import { io } from "socket.io-client";

const useSocket = () => {
    return io("http://localhost:8000");
};

export default useSocket;

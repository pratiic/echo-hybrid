import { useState } from "react";

const MessageField = () => {
    const [message, setMessage] = useState("");
    const [rows, setRows] = useState(1);

    const handleInputChange = (event) => {
        setMessage(event.target.value);
        adjustTextAreaHeight(event.target);
    };

    const adjustTextAreaHeight = (textArea) => {
        textArea.style.height = "auto";
        textArea.style.height = textArea.scrollHeight + "px";
        setRows(textArea.rows);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && event.shiftKey) {
            adjustTextAreaHeight(event.target);
        }
    };

    return (
        <div className="">
            <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={rows}
                className="rounded-full px-3 resize-none outline-none max-h-[100px] bg-gray-100 dark:bg-gray-600 black-white"
            />
        </div>
    );
};

export default MessageField;

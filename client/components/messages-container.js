import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Human from "./human";
import Message from "./message";
import { fetcher } from "../lib/fetcher";
import { resetUnseenMsgsCount, setMessages } from "../redux/slices/chat-slice";

const MessageContainer = ({ chatId }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { authUser } = useSelector((state) => state.auth);
  const { chatMessages, outgoingMsgs } = useSelector((state) => state.chat);

  const dispatch = useDispatch();
  const scrollRef = useRef();

  useEffect(() => {
    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const data = await fetcher(`messages/${chatId}`);

      dispatch(setMessages(data.messages));
      dispatch(resetUnseenMsgsCount({ chatId, userId: authUser?.id }));

      try {
        await fetcher(`chats/unseen/${chatId}`, "PATCH");
      } catch (error) {}
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderMessages = () => {
    setTimeout(() => {
      scrollRef?.current?.scrollIntoView();
    }, 100);

    return chatMessages.map((message, index) => {
      return (
        <Message
          {...message}
          authUser={authUser}
          msgIndex={index}
          key={index}
        />
      );
    });
  };

  return (
    <div className="flex flex-col max-w-[800px] mx-auto overflow-y-scroll h-[calc(100%-100px)] my-3">
      {loading ? (
        <p className="status my-auto">Loading chat messages...</p>
      ) : errorMsg ? (
        <p className="status my-auto">{errorMsg}</p>
      ) : chatMessages.length === 0 && outgoingMsgs.length === 0 ? (
        <Human name="say-hi" message="There are no messages in this chat" />
      ) : (
        <React.Fragment>
          {renderMessages()}

          {outgoingMsgs.length > 0 &&
            outgoingMsgs.map((outgoingMsg, i) => (
              <Message
                {...outgoingMsg}
                authUser={authUser}
                isOutgoing="true"
                key={i}
              />
            ))}

          <div ref={scrollRef}></div>
        </React.Fragment>
      )}
    </div>
  );
};

export default MessageContainer;

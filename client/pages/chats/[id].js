import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";

import {
  addMessage,
  deleteMessage,
  setActiveChat,
  updateMessage,
} from "../../redux/slices/chat-slice";
import { capitalizeAll } from "../../lib/strings";
import { fetcher } from "../../lib/fetcher";
import useSocket from "../../hooks/use-socket";

import ChatHeader from "../../components/chat-header";
import MessageSender from "../../components/message-sender";
import MessageContainer from "../../components/message-container";

const Chat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { activeChat } = useSelector((state) => state.chat);
  const { authUser } = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();
  const socket = useSocket();

  useEffect(() => {
    return () => {
      dispatch(setActiveChat(null));
    };
  }, []);

  useEffect(() => {
    if (!activeChat) {
      getActiveChat();
    }
  }, [activeChat, router]);

  useEffect(() => {
    socket.on("chat-message", (chatMessage) => {
      if (
        chatMessage.destinationId === authUser?.id ||
        chatMessage.userId === authUser?.id
      ) {
        dispatch(addMessage(chatMessage));
      }
    });

    socket.on("message-deleted", (msgId) => {
      dispatch(deleteMessage(msgId));
    });

    socket.on("message-updated", (data) => {
      const { id, chatId, updateInfo } = data;

      if (chatId === activeChat?.id) {
        dispatch(updateMessage({ id, updateInfo }));
      }
    });
  }, [authUser, activeChat]);

  const getActiveChat = async () => {
    if (!router?.query?.id) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetcher(`chats/${router.query.id}`, "POST");

      const chat = data.chat;
      dispatch(
        setActiveChat({
          id: chat.id,
          user: chat.users.find((user) => authUser.id !== user.id),
        })
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="status">Loading chat...</p>;
  }

  if (error) {
    return <p className="status">{error}</p>;
  }

  return (
    <div className="h-[calc(100vh-95px)]">
      <Head>
        <title>
          Chat |{" "}
          {capitalizeAll(
            `${activeChat?.user?.firstName} ${activeChat?.user?.lastName}`
          )}
        </title>
      </Head>

      <ChatHeader user={activeChat?.user} chatId={activeChat?.id} />
      <MessageContainer chatId={activeChat?.id} />
      <MessageSender chatId={activeChat?.id} />
    </div>
  );
};

export default Chat;

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Head from "next/head";

import PageHeader from "../../components/page-header";
import ContentList from "../../components/content-list";
import GenericSearch from "../../components/generic-search";

const Chats = () => {
    const [userChats, setUserChats] = useState([]);
    const [query, setQuery] = useState("");

    const { chats, chatError, loadingChats } = useSelector(
        (state) => state.chat
    );
    const { authUser } = useSelector((state) => state.auth);

    useEffect(() => {
        setUserChats(
            chats.filter((chat) => {
                const chatUser = chat.users.find(
                    (user) => user.id !== authUser?.id
                );

                if (
                    `${chatUser?.firstName} ${chatUser?.lastName}`
                        .toLowerCase()
                        .includes(query) ||
                    chatUser?.email?.includes(query)
                ) {
                    return true;
                }
            })
        );
    }, [query, chats, authUser]);

    return (
        <section>
            <Head>
                <title>Your chats ({chats?.length})</title>
            </Head>

            <PageHeader
                heading="your chats"
                count={chats?.length}
                hasBackArrow
            />

            {chats.length > 0 && (
                <div className="mb-5 -mt-2">
                    <GenericSearch
                        show={true}
                        placeholder="Name or email"
                        resultsLength={query && userChats.length}
                        resultType="chats"
                        onChange={setQuery}
                    />
                </div>
            )}

            <ContentList
                list={userChats.map((chat) => {
                    const chatUser = chat.users.find(
                        (user) => user.id !== authUser?.id
                    );

                    // convert from chat to user to display on a user card
                    const formattedChat = {
                        ...chatUser,
                        chatId: chat.id,
                        isLink: true,
                        counts: chat.unseenMsgsCounts,
                    };
                    return formattedChat;
                })}
                type="user"
                error={chatError}
                loadingMsg={loadingChats && "Loading your chats..."}
                emptyMsg={query ? "No chats found" : "You have no chats"}
                human="no-chats"
            />
        </section>
    );
};

export default Chats;

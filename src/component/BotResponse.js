// @flow
import React, { useEffect } from "react";
import Markdown from "react-markdown";
import breaks from "remark-breaks";
import classnames from "classnames";
import type { ChatMessage } from "./Chatroom";


type MessageProps = {
  chat: ChatMessage,
  onButtonClick?: (title: string, payload: string) => void,
  voiceLang?: ?string
};

const Message = ({ chat, onButtonClick, voiceLang = null }: MessageProps) => {
  const message = chat.message;
  const isBot = chat.username === "bot";

  // Create different element for different types of messages
  switch (message.type) {
    case "image":
      return (
        <li className={`chat ${isBot ? "left" : "right"} chat-img`}>
          <img src={message.image} alt="" />
        </li>
      );
    case "text":
      return (
        <li className={classnames("chat", isBot ? "left" : "right")}>
          <Markdown
            className="text"
            source={message.text}
            skipHtml={false}
            allowedTypes={[
              "root",
              "break",
              "paragraph",
              "emphasis",
              "strong",
              "link",
              "list",
              "listItem",
              "image"
            ]}
            renderers={{
              paragraph: ({ children }) => <span>{children}</span>,
              link: ({ href, children }) => (
                <a href={href} target="_blank">
                  {children}
                </a>
              )
            }}
            plugins={[breaks]}
          />
        </li>
      );
    default:
      return null;
  }
};

export default Message;
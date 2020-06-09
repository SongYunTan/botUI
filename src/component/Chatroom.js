// @flow
import React, {Component, Fragment} from 'react'
import ReactDOM from 'react-dom'

import {Message} from "./BotResponse";

export type MessageType =
  | { type: "text", text: string }
  | { type: "image", image: string }
  | {
      type: "button",
      buttons: Array<{ payload: string, title: string, selected?: boolean }>
    }
  | { type: "custom", content: any };

export type ChatMessage = {
  message: MessageType,
  username: string,
  voiceLang?: string
};

const MessageGroup = ({ messages, onButtonClick, voiceLang }) => {
  const isBot = messages[0].username === "bot";
  const isButtonGroup =
    messages.length === 1 && messages[0].message.type === "button";
  return (
    <Fragment>
      {messages.map((message, i) => (
        <Message
          chat={message}
          key={i}
          onButtonClick={onButtonClick}
          voiceLang={voiceLang}
        />
      ))}
    </Fragment>
  );
};

type ChatroomProps = {
  messages: Array<ChatMessage>,
  title: string,
  isOpen: boolean,
  waitingForBotResponse: boolean,
  speechRecognition: ?string,
  onSendMessage: (message: string) => *,
  voiceLang: ?string
};

export class Chatroom extends Component<ChatroomProps> {

  groupMessages(messages: Array<ChatMessage>) {
    if (messages.length === 0) return [];

    let currentGroup = [messages[0]];
   
    let lastUsername = messages[0].username;
    let lastType = messages[0].message.type;
    const groups = [currentGroup];

    for (const message of messages.slice(1)) {
      if (
        // Messages are grouped by user/bot
        message.username !== lastUsername
      ) {
        // new group
        currentGroup = [message];
        groups.push(currentGroup);
      } else {
        // append to group
        currentGroup.push(message);
      }
      lastUsername = message.username;
      lastType = message.message.type;
    }
    return groups;
  }

  handleSubmitMessage() {
    let userInput = document.querySelector(".userInput");
    let intent = userInput.value.trim; 
    this.props.onSendMessage(intent);
  }

  handleButtonClick() {
    return
  }

  render() {
    const { messages, isOpen, waitingForBotResponse, voiceLang } = this.props;
    const messageGroups = this.groupMessages(messages);
    const isClickable = i =>
      !waitingForBotResponse && i == messageGroups.length - 1;
    return (
      <div className="chats">
        <div>
          {messageGroups.map((group, i) => (
            <MessageGroup
              messages={group}
              key={i}
              onButtonClick={this.handleButtonClick}
              voiceLang={voiceLang}
            />
          ))}
        </div>
        <form>
          <input className="userInput" type="text" name="user input" value="user input" required autofocus/>
          <br/>
          <input type="submit" value="Send" onSubmit={this.handleSubmitMessage}/>
        </form>
      </div>
    )
  }
}
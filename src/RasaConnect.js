// @flow
import React, { Component } from "react";
import type { ChatMessage, MessageType } from "./component/Chatroom";
import {Chatroom} from "./component/Chatroom";

type RasaConnectProps = {
  userId: string,
  host: string,
  welcomeMessage: ?string,
  title: string,
  waitingTimeout: number,
  speechRecognition: ?string,
  messageBlacklist: Array<string>,
  fetchOptions?: RequestOptions,
  voiceLang: ?string
};

type RasaConnectState = {
  messages: Array<ChatMessage>,
  messageQueue: Array<ChatMessage>,
  isOpen: boolean,
  waitingForBotResponse: boolean
};

type RasaMessage =
  | {| sender_id: string, text: string |}
  | {|
      sender_id: string,
      buttons: Array<{ title: string, payload: string, selected?: boolean }>,
      text?: string
    |}
  | {| sender_id: string, image: string, text?: string |}
  | {| sender_id: string, attachment: string, text?: string |};

export class RasaConnect extends Component<RasaConnectProps, RasaConnectState> {

  state = {
    messages: [],
    messageQueue: [],
    isOpen: false,
    waitingForBotResponse: false
  };

  sendMessage = async (messageText: string) => {
    if (messageText === "") return;

    const messageObj = {
      message: { type: "text", text: messageText },
      username: this.props.userId,
    };

    const rasaMessageObj = {
      message: messageObj.message.text,
      sender: this.props.userId
    };

    // Get message from rasa bot
    const fetchOptions = Object.assign({}, {
      method: "POST",
      body: JSON.stringify(rasaMessageObj),
      headers: {
        "Content-Type": "application/json"
      }
    }, this.props.fetchOptions);

    const response = await fetch(
      `${this.props.host}/webhooks/rest/webhook`,
      fetchOptions
    );
    const messages = await response.json();

    this.parseMessages(messages);

  }

  createNewBotMessage(botMessageObj: MessageType): ChatMessage {
    return {
      message: botMessageObj,
      username: "bot",
    };
  }

  async parseMessages(RasaMessages: Array<RasaMessage>) {
    const validMessageTypes = ["text", "image", "buttons", "attachment"];

    let expandedMessages = [];

    // Create messages based on tye of message
    RasaMessages.filter((message: RasaMessage) =>
      validMessageTypes.some(type => type in message)
    ).forEach((message: RasaMessage) => {
      let validMessage = false;
      if (message.text) {
        validMessage = true;
        expandedMessages.push(
          this.createNewBotMessage({ type: "text", text: message.text })
        );
      }

      if (message.image) {
        validMessage = true;
        expandedMessages.push(
          this.createNewBotMessage({ type: "image", image: message.image })
        );
      }

      if (validMessage === false)
        throw Error("Could not parse message from Bot or empty message");
    });
  }

  render(){
    const { messages, waitingForBotResponse } = this.state;

    const renderableMessages = messages
      .filter(
        message =>
          message.message.type !== "text" ||
          !this.props.messageBlacklist.includes(message.message.text)
      );

    return (
      <Chatroom
        messages={renderableMessages}
        title={this.props.title}
        waitingForBotResponse={waitingForBotResponse}
        isOpen={this.state.isOpen}
        speechRecognition={this.props.speechRecognition}
        onSendMessage={this.sendMessage}
        voiceLang={this.props.voiceLang}
      />
    );
  }
}

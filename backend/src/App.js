import React from "react";
import { createAssistant, createSmartappDebugger } from "@salutejs/client";
import axios from "axios";

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === "development") {
    console.log("Дев мод");
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "",
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
    });
  }
  return createAssistant({ getState });
};

export class App extends React.Component {
  constructor(props) {
    super(props);
    console.log("constructor");

    this.state = {
      productInfo: null,
      infoNotFound: false,
    };

    this.assistant = initializeAssistant(() => {});

    this.assistant.on("data", (event /* : any */) => {
      console.log(`assistant.on(data)`, event);
      if (event.type === "character") {
        console.log(`assistant.on(data): character: "${event?.character?.id}"`);
      } else if (event.type === "insets") {
        console.log(`assistant.on(data): insets`);
      } else if (event.type === "smart_app_data") {
        const { action } = event;
        console.log(action.product);
        this.dispatchAssistantAction(action.product);
      } else {
        console.log("Что ты такое");
      }
    });
  }

  async translateText(text) {
    try {
      const response = await axios.post("http://localhost:3001/translate", { text });
      return response.data.translatedText;
    } catch (error) {
      console.error("Ошибка при переводе:", error);
      return "";
    }
  }

  fetchProductInfo = async (productName) => {
    const fetchWithTimeout = (url, timeout = 1000) => {
      return Promise.race([
        axios.get(url),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout)),
      ]);
    };

    try {
      const response = await fetchWithTimeout(`http://localhost:3001/product-info/${productName}`);
      if (response.data && response.data.foods && response.data.foods.length > 0) {
        const productInfo = response.data.foods[0];
        this.setState({ productInfo: productInfo, infoNotFound: false });
      } else {
        this.setState({ productInfo: null, infoNotFound: true });
      }
    } catch (error) {
      console.error("Ошибка запроса к серверу:", error);
      this.setState({ productInfo: null, infoNotFound: true });
    }
  };

  async dispatchAssistantAction(action) {
    const actionENG = await this.translateText(action);
    this.fetchProductInfo(actionENG);
    console.log(actionENG);
  }

  getStateForAssistant() {
    const state = {
      productInfo: this.state.productInfo,
    };
    return state;
  }
}
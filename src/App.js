import React from "react";
import { createAssistant, createSmartappDebugger } from "@salutejs/client";
import axios from "axios";
import './App.css';
import './include/InputField.css';
import { MakeTable } from "./include/MakeTable";
import { Button } from '@salutejs/plasma-ui';

window.addEventListener('keydown', (event) => {
  const inputField = document.getElementById('input-field');
  const searchButton = document.getElementById('search-button');
  switch (event.code) {
    case 'ArrowDown':
      searchButton.focus();
      break;
    case 'ArrowUp':
      inputField.focus();
      break;
  }
});

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
    console.log('constructor');

    this.state = {
      infoNotFound: true,
      productInfo: null,
      productName: '',
      inputValue: '',
    };

    this.justOpened = true;
    this.assistant = initializeAssistant(() => { });

    this.assistant.on("data", (event) => {
      console.log(`assistant.on(data)`, event);
      if (event.type === "character") {
        console.log(`assistant.on(data): character: "${event?.character?.id}"`);
      } else if (event.type === "insets") {
        console.log(`assistant.on(data): insets`);
      } else if (event.type === "smart_app_data") {
        const { action } = event;
        if (action && action.product) {
          console.log(action.product);
          this.dispatchAssistantAction(action.product);
          this.setState({ productName: action.product });
        }
      }
    });
  }

  async translateText(text) {
    try {
      const response = await axios.post('http://45.67.57.139:3001/translate', { text });
      return response.data.translatedText;
    } catch (error) {
      console.error("Ошибка при переводе:", error);
      return "";
    }
  }

  fetchProductInfo = async (productName) => {
    try {
      const response = await axios.get(`http://45.67.57.139:3001/product-info/${productName}`);
      if (response.data && response.data.foods) {
        const lowerCaseProductName = productName.toLowerCase();
        let productInfo = response.data.foods.find(food => 
          food.description.toLowerCase().includes(lowerCaseProductName) && food.dataType === 'Branded'
        );
        
        if (!productInfo || !this.hasCompleteNutritionData(productInfo)) {
          productInfo = response.data.foods.find(food => 
            food.description.toLowerCase().includes(lowerCaseProductName) && food.dataType === 'Foundation'
          );
        }
  
        if (productInfo) {
          this.setState({ productInfo: productInfo, infoNotFound: false });
        } else {
          this.setState({ productInfo: null, infoNotFound: true });
        }
      } else {
        this.setState({ productInfo: null, infoNotFound: true });
      }
    } catch (error) {
      console.error('Ошибка запроса к серверу:', error);
      this.setState({ productInfo: null, infoNotFound: true });
    }
  };

  hasCompleteNutritionData(productInfo) {
    const requiredNutrients = [1003, 1004, 1005, 1008]; // IDs для белков, жиров, углеводов и калорий
    return requiredNutrients.every(id => this.findNutrientValue(productInfo, id) !== '-');
  }

  findNutrientValue(productInfo, id) {
    const unitNameMap = {
      "G": "гр.",
      "MG": "мг.",
      "KCAL": "ккал."
    };
    const nutrient = productInfo.foodNutrients.find(nutrient => nutrient.nutrientId === id);
    return nutrient ? [nutrient.value, unitNameMap[nutrient.unitName]] : '-';
  }

  async dispatchAssistantAction(action) {
    this.queryBackend(action);
  }

  async queryBackend(productName) {
    const productNameEn = await this.translateText(productName);
    console.log('productNameEn:', productNameEn);
    this.fetchProductInfo(productNameEn);
  }

  getStateForAssistant() {
    const state = {
      productInfo: this.state.productInfo,
    };
    return state;
  }

  onProductNameSubmit = async (event) => {
    event.preventDefault();
    await this.setState({ productName: this.state.inputValue.toLowerCase() });

    const translatedProductName = await this.translateText(this.state.productName);
    console.log(translatedProductName);

    this.fetchProductInfo(translatedProductName);
  }

  capitalizeName = (text) => {
    const temp = text.split(" ");
    for (let i = 0; i < temp.length; i++) {
      temp[i] = temp[i][0].toUpperCase() + temp[i].substring(1);
    }
    return temp.join(" ");
  }

  onProductNameChange = event => {
    this.setState({ inputValue: event.target.value.toLowerCase() });
  }

  findValue = id => {
    if (!this.state.productInfo) return ['-', ''];

    const nutrient = this.state.productInfo.foodNutrients.find(nutrient => nutrient.nutrientId == id);
    const unitNameMap = {
      "G": "гр.",
      "MG": "мг.",
      "KCAL": "ккал."
    };
    return nutrient ? [nutrient.value, unitNameMap[nutrient.unitName]] : ['-', ''];
  }

  render() {
    const nutrientIds = {
      protein: 1003,
      fat: 1004,
      carbohydrates: 1005,
      calories: 1008
    };

    let protein_ = ['-', ''];
    let fat_ = ['-', ''];
    let carbohydrates_ = ['-', ''];
    let calories_ = ['-', ''];

    let information_string = "Информация о продукте не найдена";

    if (this.justOpened) {
      information_string = "";
    }

    const hasNutritionData = this.state.productInfo &&
      this.findValue(nutrientIds.protein)[0] !== '-' &&
      this.findValue(nutrientIds.fat)[0] !== '-' &&
      this.findValue(nutrientIds.carbohydrates)[0] !== '-' &&
      this.findValue(nutrientIds.calories)[0] !== '-';

    if (this.state.infoNotFound && !this.justOpened) {
      information_string = "Информация о продукте не найдена";
    } else if (this.state.productInfo && hasNutritionData) {
      protein_ = this.findValue(nutrientIds.protein);
      fat_ = this.findValue(nutrientIds.fat);
      carbohydrates_ = this.findValue(nutrientIds.carbohydrates);
      calories_ = this.findValue(nutrientIds.calories);

      information_string = `Информация про «${this.capitalizeName(this.state.productName)}» на 100г:`;
      this.justOpened = false;
    }

    return (
      <div className="App">
        <div className="m-auto">
          <form onSubmit={this.onProductNameSubmit}>
            <input
              type="text"
              className="write-product"
              id="input-field"
              onChange={this.onProductNameChange}
              pattern="[a-zA-Zа-яА-Я ]*"
              title="Допустимы только символы латиницы и кириллицы."
              placeholder="Продукт"
            />
          </form>
          <div className="Button">
            <Button onClick={this.onProductNameSubmit}
              size="l"
              pin="circle-circle"
              id="search-button"
            >Найти продукт </Button>
          </div>
        </div>
        <div className="m-auto">
          <h2 id="Info">{information_string}</h2>
        </div>
        <div className="m-auto">
          {(hasNutritionData || this.justOpened) && 
            <MakeTable protein={protein_} fat={fat_} carbohydrates={carbohydrates_} calories={calories_} />
          }
        </div>
      </div>
    );
  }
}
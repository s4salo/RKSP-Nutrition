import React from "react";
import {createAssistant, createSmartappDebugger,} from "@salutejs/client";
import axios from "axios";
import './App.css'
import './include/InputField.css'
import { MakeTable } from "./include/MakeTable";
import { Button, TextField } from '@salutejs/plasma-ui';



//----------
window.addEventListener('keydown', (event) => {
  const inputField = document.getElementById('input-field');
  const searchButton = document.getElementById('search-button');
  switch(event.code) {
    case 'ArrowDown':
      // вниз
      searchButton.focus();
      break;
     case 'ArrowUp':
      // вверх
      inputField.focus();
      break;
  }
});
//----------

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === "development") {
    console.log("Дев мод")
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "",
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
    });
  }
  return createAssistant({getState});
};

export class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('constructor');

    this.state = {
      productInfo: null,
      productName: '', 
      inputValue : '',
    };

    this.justOpened = true;

    this.assistant = initializeAssistant(() => {});

    this.assistant.on("data", (event/*: any*/) => {
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
          this.setState({ productName: action.product }); // Обновляем состояние с именем продукта
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
      if (response.data && response.data.foods && response.data.foods.length > 0) {
        const productInfo = response.data.foods[0];
        this.setState({ productInfo: productInfo});
      }
    } catch(error) {
      console.error('Ошибка запроса к серверу:', error);
    }
  };

  async dispatchAssistantAction(action) {
    // const actionENG = await this.translateText(action);
    // this.fetchProductInfo(actionENG);
    // console.log(actionENG);
    this.queryBackend(action);
  }

  async queryBackend(productName) {
    const productNameEn = await this.translateText(productName);
    // this.fillDisplayedName(productName);
    console.log('productNameEn:', productNameEn);
    this.fetchProductInfo(productNameEn);
  }
  getStateForAssistant() {
    const state = {
      productInfo: this.state.productInfo,      
    };
    return state;  
  }

  onProductNameSubmit = async (event) =>{
    event.preventDefault();
    await this.setState({productName: this.state.inputValue.toLowerCase()});
    
    const translatedProductName = await this.translateText(this.state.productName);
    console.log(translatedProductName);

    this.fetchProductInfo(translatedProductName);
  }

  capitalizeName = (text) => {
    const temp = text.split(" ");
    for (let i = 0; i < temp.length; i++) {
      temp[i] = temp[i][0].toUpperCase() + temp[i].substr(1);
    }
    return temp.join(" ");
  }

  onProductNameChange = event => {
    this.setState({inputValue: event.target.value.toLowerCase()});
  }


  // Функция поиска значения некоторой характеристики продукта
  findValue = id =>{
    const len = this.state.productInfo.foodNutrients.length;
    const unitNameMap = {
      "G" : "гр.",
      "MG": "мг.",
      "KCAL": "ккал."
    }
    for (let i = 0; i < len; i++){
      if (this.state.productInfo.foodNutrients[i].nutrientId == id){
        return [this.state.productInfo.foodNutrients[i].value, unitNameMap[this.state.productInfo.foodNutrients[i].unitName]];
      }
    }
    return ['-', ''];
  }

  render() {

    const nutrientIds = {
      protein: 1003,
      fat: 1004,
      carbohydrates: 1005,
      calories: 1008
    }

    let protein_ = ['-', ''];
    let fat_ = ['-', ''];
    let carbohydrates_ = ['-', ''];
    let calories_ = ['-', ''];

    let information_string = "Информация о продукте не найдена"

    if (this.justOpened){
      information_string = '';
    }

    if (this.state.productInfo){
      protein_ = this.findValue(nutrientIds.protein);
      fat_ = this.findValue(nutrientIds.fat);
      carbohydrates_ = this.findValue(nutrientIds.carbohydrates);
      calories_ = this.findValue(nutrientIds.calories);
      

      information_string = `Информация о продукте «${this.capitalizeName(this.state.productName)}»:`
      this.justOpened = false;
    }

    return (
      <div className="App">
        <div class="m-auto">
          <form onSubmit={this.onProductNameSubmit}>
            
            <input type="text" 
            class="write-product" 
            id="input-field" 
            onChange={this.onProductNameChange}
            pattern="[a-zA-Zа-яА-Я ]*" 
            title="Допустимы только символы латиницы и кириллицы." 
            placeholder="Наименование продукта">

            </input>
            {/* <Button onClick = {this.onProductNameSubmit}  
            size = "l"
            pin = "circle-circle"
            >Боб</Button> */}
          </form>
          <Button onClick = {this.onProductNameSubmit}  
            size = "l"
            pin = "circle-circle"
            >Найти продукт</Button>

        </div>
        <br></br>
        <div class="m-auto">
          <h2>{information_string}</h2>
        </div>
        <div class="m-auto">
          <MakeTable protein={protein_} fat={fat_} carbohydrates={carbohydrates_} calories={calories_} />
        </div>
      </div>
      );
  }
}



import React from "react";
import {createAssistant, createSmartappDebugger,} from "@salutejs/client";
import axios from "axios";
import './App.css'
import './include/InputField.css'
import { MakeTable } from "./include/MakeTable";

//Временные импорты
import { Button, TextField } from '@salutejs/plasma-ui';
import { Container } from '@salutejs/plasma-ui/components/Grid';
import { darkJoy, darkEva, darkSber } from '@salutejs/plasma-tokens/themes';
import { text, background, gradient } from '@salutejs/plasma-tokens';
import { createGlobalStyle } from 'styled-components';
const ThemeBackgroundEva = createGlobalStyle(darkEva);
const ThemeBackgroundSber = createGlobalStyle(darkSber);
const ThemeBackgroundJoy = createGlobalStyle(darkJoy);
//

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


//Вот тут измененения в состоянии, чтобы ассистента менять
export class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('constructor');

    this.state = {
      productInfo: null, 
      productName: '',
      //мяу
      character: 'sber'
    };

    this.assistant = initializeAssistant(() => {});

    this.assistant.on("data", (event/*: any*/) => {
      console.log(`assistant.on(data)`, event);
      if (event.type === "character") {
        console.log(`assistant.on(data): character: "${event?.character?.id}"`);
        //Гав
        this.setState({character: event.character.id})
      } else if (event.type === "insets") {
        console.log(`assistant.on(data): insets`);
      } else if (event.type === "smart_app_data") {

        const {action} = event;
      //Тут какие то системные прилетали и  я вот так решила
        if (action){
          console.log(action.product)
        this.dispatchAssistantAction(action.product);
        }
        
      }
      else{
        console.log("Что ты такое")
      }
    });

  }

  async translateText(text) {
    try {
      const response = await axios.post('http://localhost:3001/translate', { text });
      return response.data.translatedText;
    } catch (error) {
      console.error("Ошибка при переводе:", error);
      return "";
    }
  }
    


  fetchProductInfo = async (productName) => {
    try {
      const response = await axios.get(`http://localhost:3001/product-info/${productName}`);
      if (response.data && response.data.foods && response.data.foods.length > 0) {
        const productInfo = response.data.foods[0];
        this.setState({ productInfo: productInfo });
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
    console.log('productNameEn:',productNameEn);
    this.fetchProductInfo(productNameEn);
  }

  getStateForAssistant() {
      const state = {
      productInfo: this.state.productInfo,      
    };
    return state;  
  }

  onProductNameSubmit = event =>{
    event.preventDefault();
    console.log(this.state.productName);
    this.fetchProductInfo(this.state.productName);
    console.log(this.state.productInfo);
    this.setState({
      productInfo : null
    })
  }

  onProductNameChange = event =>{
    this.setState({
        productName: event.target.value,
    });
        console.log(this.state.productName);
    }


  // Функция поиска значения некоторой характеристики продукта
  findValue(id){
    const len = this.state.productInfo.foodNutrients.length;
    for (let i = 0; i < len; i++){
      if (this.state.productInfo.foodNutrients[i].nutrientId == id){
        return this.state.productInfo.foodNutrients[i].value;
      }
    }
    return -1;
  }

  render() {
    const { theme, character, productInfo } = this.state;
    {(() => {
      switch (character) {
          case 'sber':
              return <ThemeBackgroundSber />;
          case 'eva':
              return <ThemeBackgroundEva />;
          case 'joy':
              return <ThemeBackgroundJoy />;
          default:
              return;
      }
  })()}
    if (this.state.productInfo){
      const nutrientIds = {
        protein: 1003,
        fat: 1004,
        carbohydrates: 1005,
        calories: 1008
      }

      let protein_ = this.findValue(nutrientIds.protein);
      let fat_ = this.findValue(nutrientIds.fat);
      let carbohydrates_ = this.findValue(nutrientIds.carbohydrates);
      let calories_ = this.findValue(nutrientIds.calories);


      return (

        <div className="App">        
          <div class="m-auto">
            <form onSubmit={this.onProductNameSubmit}>
              <input type="text" class="write-product" id="input-field" onChange={this.onProductNameChange}></input>
            </form>
          </div>
          <br></br>
          <div class="m-auto">
            <MakeTable protein={protein_} fat={fat_} carbohydrates={carbohydrates_} calories={calories_} />;
          </div>
        </div>
      );
    }

    return (
      <div className="App">
        <div class="m-auto">

          <form onSubmit={(event) => {
            //event.preventDefault(); 
            this.queryBackend(this.state.productName); 
          }}>
            <input
              type="text"
              className="write-product"
              id="input-field"
              placeholder="Введите текст"
              value={this.state.productName}
              onChange={(event) => {
                this.setState({ productName: event.target.value })
              }}
            />
          </form>
          <Button onClick={() => {
            console.log('btn')
            this.queryBackend(this.state.productName)
          }}>Найти продукт</Button>
        </div>
        <br />
        <div class="m-auto">
          <MakeTable protein={'-'} fat={'-'} carbohydrates={'-'} calories={'-'} />
        </div>
        
      </div>
      
    );

  }
}



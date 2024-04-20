import React from "react";
import { createAssistant, createSmartappDebugger, } from "@salutejs/client";
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
  return createAssistant({ getState });
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
      returnedProductName: '',
      character: 'sber',
      mistake: ''
    };



    this.assistant = initializeAssistant(() => { });

    this.assistant.on("data", (event/*: any*/) => {
      console.log(`assistant.on(data)`, event);
      if (event.type === "character") {
        console.log(`assistant.on(data): character: "${event?.character?.id}"`);
        //Гав
        this.setState({ character: event.character.id })
      } else if (event.type === "insets") {
        console.log(`assistant.on(data): insets`);
      } else if (event.type === "smart_app_data") {

        const { action } = event;
        //Тут какие то системные прилетали и  я вот так решила
        if (action) {
          console.log(action.product)
          this.dispatchAssistantAction(action.product);
        }

      }
      else {
        console.log("Что ты такое")
      }
    });

  }
  // нужна помощь
  clearProductName() {
    this.setState({ productName: '' });
  }
  checkName = (productName) => {
    return /^[a-zA-Z\s]*$/.test(productName);
  }

  fillDisplayedName(text){
    this.setState({
      returnedProductName : text
    })
  }
  hasOnlyLetters = (str) => {
    // Проверяем строку на наличие цифр или символов, не относящихся к буквам
    //если есть что то из этого, то true
    return !(/[0-9!@#$%^&*()_+{}\[\]:;<>,.?/~`|\\-]/.test(str));
  }
  // помощь 

  async translateText(text) {
    try {
      const response = await axios.post('http://localhost:3001/translate', { text });
      // this.setState ({
      //   returnedProductName: text
      // });
      return response.data.translatedText;
    } catch (error) {
      console.error("Ошибка при переводе:", error);
      return "";
    }
  }



  fetchProductInfo = async (productName) => {
    try {
      const response = await axios.get(`http://localhost:3001/product-info/${productName}`);
      //console.log( response.data.foods[0]);
      if (response.data && response.data.foods && response.data.foods.length > 0) {
        const productInfo = response.data.foods[0];
        this.setState({ productInfo: productInfo });
        this.setState({mistake: false}); //нет ошибки
        //this.setState({returnedProductName: response.data.foods[0]});
      }
      else {
        this.setState({mistake: true});
      }
    } catch (error) {
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
    this.fillDisplayedName(productName);
    console.log('productNameEn:', productNameEn);
    this.fetchProductInfo(productNameEn);
  }

  getStateForAssistant() {
    const state = {
      productInfo: this.state.productInfo,
    };
    return state;
  }

  onProductNameSubmit = async event => {
    event.preventDefault();

    console.log(this.state.productName);

    const translatedProductName = await this.translateText(this.state.productName);
    console.log(translatedProductName);

    this.fetchProductInfo(translatedProductName);
    console.log(this.state.productInfo);
    this.setState({
      productInfo: null,
    })



  }
  // как я понимаю на правильность ввод надо проверять тут
  onProductNameChange = (event) => {
    const inputValue = event.target.value;
    this.setState({
      productName: inputValue,
      mistake: !this.checkName(inputValue)
      //mistake: !this.checkName(inputValue)
    });
    console.log(this.state.returnedProductName);
  }


  // Функция поиска значения некоторой характеристики продукта
  findValue = id => {
    if (this.state.productInfo) {
      const len = this.state.productInfo.foodNutrients.length;
      const unitNameMap = {
        "G": "гр.",
        "MG": "мг.",
        "KCAL": "ккал."
      }
      for (let i = 0; i < len; i++) {
        if (this.state.productInfo.foodNutrients[i].nutrientId == id) {
          return [this.state.productInfo.foodNutrients[i].value, unitNameMap[this.state.productInfo.foodNutrients[i].unitName]];
        }
      }
    }
    return ['-', ''];
  }


  render() {
    const { theme, character, productInfo, returnedProductName, mistake } = this.state;
    const tempName = this.state.returnedProductName;

    const InputBox = () => (
      <form onSubmit={(event) => {
        //event.preventDefault(); 
        this.queryBackend(this.state.productName);
      }}>
        <input
          type="text"
          //className={"write-product "}
          className={"write-product " + (mistake ? 'mistake' : '')}
          id="input-field"
          placeholder="Введите текст"
          value={this.state.productName}
          onChange={(event) => {
            this.setState({ productName: event.target.value })
          }}
        />
      </form>
    )

    const SearchButton = () => (
      <Button onClick={() => {
        this.queryBackend(this.state.productName);
        this.clearProductName();
      }}>Найти продукт</Button>
      
    )


    const nutrientIds = {
      protein: 1003,
      fat: 1004,
      carbohydrates: 1005,
      calories: 1008
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
              //className={"write-product "}
              className={"write-product " + (mistake ? 'mistake' : '')}
              id="input-field"
              placeholder="Введите текст"
              value={this.state.productName}
              onChange={(event) => {
                this.setState({ productName: event.target.value })
              }}
              
            />
          </form>
          <SearchButton />
        </div>
        <br />

        {/* {
          this.state.productInfo && !mistake &&
            <h2>Информация о продукте "{tempName}"</h2>
        } */}
        {
           this.state.productInfo && !mistake ? (
            <h2>Информация о продукте "{tempName}"</h2>
          ) : (
            <h2>Ошибка ввода, повторите попытку</h2>
          )
        }

        <div class="m-auto">
          <MakeTable
            protein={this.findValue(nutrientIds.protein)}
            fat={this.findValue(nutrientIds.fat)}
            carbohydrates={this.findValue(nutrientIds.carbohydrates)}
            calories={this.findValue(nutrientIds.calories)}
          />
        </div>
      </div>

    );

  }
}



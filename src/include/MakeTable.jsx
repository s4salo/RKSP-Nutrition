import React from "react";
import './Table.css'
import '../App.css'

export function MakeTable(args){
    return(
        <table class="m-auto">
            <tr>
                <th style={{borderTopLeftRadius: "50px"}}>Белки</th>
                <td style={{borderTopRightRadius: "50px"}}>{args.protein}</td>
            </tr>
            <tr>
                <th>Жиры</th>
                <td>{args.fat}</td>
            </tr>
            <tr>
                <th>Углеводы</th>
                <td>{args.carbohydrates}</td>
            </tr>
            <tr>
                <th style={{borderBottomLeftRadius: "50px"}}>Калории</th>
                <td style={{borderBottomRightRadius: "50px"}}>{args.calories}</td>
            </tr>
        </table>
    )
}
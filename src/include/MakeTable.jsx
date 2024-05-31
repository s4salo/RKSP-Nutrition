import React from "react";
import './Table.css'
import '../App.css'

export function MakeTable(args){
    return(
        <table class="m-auto">
            <tr>
                <th style={{borderTopLeftRadius: "20px"}}>Белки</th>
                <td style={{borderTopRightRadius: "20px"}}>{args.protein[0]} {args.protein[1]}</td>
            </tr>
            <tr>
                <th>Жиры</th>
                <td>{args.fat[0]} {args.fat[1]}</td>
            </tr>
            <tr>
                <th>Углеводы</th>
                <td>{args.carbohydrates[0]} {args.carbohydrates[1]}</td>
            </tr>
            <tr>
                <th style={{borderBottomLeftRadius: "20px"}}>Калории</th>
                <td style={{borderBottomRightRadius: "20px"}}>{args.calories[0]} {args.calories[1]}</td>
            </tr>
        </table>
    )
}

import React from "react";
import './Table.css'
import '../App.css'

export function MakeTable(args){
    return(
        <table class="m-auto">
            <tr>
                <th style={{borderTopLeftRadius: "50px"}}>Белки</th>
                <td style={{borderTopRightRadius: "50px"}}>{args.protein[0]} {args.protein[1]}</td>
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
                <th style={{borderBottomLeftRadius: "50px"}}>Калории</th>
                <td style={{borderBottomRightRadius: "50px"}}>{args.calories[0]} {args.calories[1]}</td>
            </tr>
        </table>
    )
}

import React from 'react';
// GlobalStyle.tsx
import { createGlobalStyle } from 'styled-components';

// Или один из списка: darkEva, darkJoy, lightEva, lightJoy, lightSber
import { darkSber } from '@salutejs/plasma-tokens/themes';


import {
    text, // Цвет текста
    background, // Цвет подложки
    gradient, // Градиент
} from '@salutejs/plasma-tokens';

const DocumentStyle = createGlobalStyle`
    html:root {
        min-height: 100vh;
        color: ${text};
        background: rgb(9,10,18);
        background: linear-gradient(21deg, rgba(9,10,18,1) 5%, rgba(23,50,66,1) 50%, rgba(14,61,44,1) 90%);
    }
`;

const ThemeStyle = createGlobalStyle(darkSber);

export const GlobalStyle = () => (
    <>
        <DocumentStyle />
        <ThemeStyle />
    </>
);
// {
//     background-color: ${background};
//         background-image: ${gradient};
// }

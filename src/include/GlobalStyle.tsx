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
        background-color: ${background};
        background-image: ${gradient};
    }
`;

const ThemeStyle = createGlobalStyle(darkSber);

export const GlobalStyle = () => (
    <>
        <DocumentStyle />
        <ThemeStyle />
    </>
);
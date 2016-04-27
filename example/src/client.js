import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import sum from './lib/sum';
import './index.scss';

sum(1, 2, 3, 4, 5, 6, 8);

console.log(renderToStaticMarkup(<h1>Hello Client!</h1>));

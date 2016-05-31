import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import sum from './lib/sum';
import data from './lib/data';

sum(1, 2, 3, 4, 5, 6, 8);

console.log(renderToStaticMarkup(<h1>{data.msg}</h1>));

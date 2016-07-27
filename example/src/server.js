import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import App from './lib/App';
import sum from './lib/sum';
import data from './lib/data';
import './client.scss';

sum(1, 2, 3, 4, 5, 6, 7);

console.log(renderToStaticMarkup(
  <App>
    <h1>{data.msg}</h1>
  </App>
)); //eslint-disable render

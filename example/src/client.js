import React from 'react';
import {render} from 'react-dom';
import App from './lib/App';
import sum from './lib/sum';
import data from './lib/data';
import './client.scss';

sum(1, 2, 3, 4, 5, 6, 8);

render(
  <App>
    <h1>{data.msg}</h1>
  </App>,
  document.getElementById('app')
);

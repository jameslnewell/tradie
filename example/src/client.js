import React from 'react';
import {render} from 'react-dom';
import sum from './lib/sum';
import data from './lib/data';
import './client.scss';

sum(1, 2, 3, 4, 5, 6, 8);

render(<h1>{data.msg}</h1>, document.body);

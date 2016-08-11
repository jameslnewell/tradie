import React from 'react';
import placeholder from '../img/placeholder.svg';

export default function App(props) {
  const {children} = props;
  return (
    <div>
      <h1>App</h1>
      <img src={placeholder}/>
      {children}
    </div>
  );
}

App.propTypes = {
  children: React.PropTypes.node
};

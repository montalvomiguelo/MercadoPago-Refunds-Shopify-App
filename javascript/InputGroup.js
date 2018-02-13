import React from 'react';

import { TextField } from '@shopify/polaris';

function InputGroup(props) {
  return (
    <div className="input-group">
      <span className="input-group-append">{props.append}</span>
      <TextField
        type="text"
        value={props.value}
      />
    </div>
  );
}

export default InputGroup;

import React from 'react';

import PropTypes from 'prop-types';

import { TextField } from '@shopify/polaris';

function InputGroup(props) {
  return (
    <div className="input-group">
      <span className="input-group-append">{props.append}</span>
      <TextField
        type="number"
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
}

InputGroup.propTypes = {
  onChange: PropTypes.func.isRequired
}

export default InputGroup;

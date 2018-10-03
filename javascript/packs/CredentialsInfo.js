import React from 'react';

import { Link, List } from '@shopify/polaris';

function CredentialsInfo(props) {
  return (
    <div>
      <p>Fill the CLIENT ID and CLIENT SECRET. To get them, go to:</p>
      <br />
      <List>
        <List.Item><Link url="https://www.mercadopago.com/mla/account/credentials?type=basic" external={true}>Argentina</Link></List.Item>
        <List.Item><Link url="https://www.mercadopago.com/mlb/account/credentials?type=basic" external={true}>Brazil</Link></List.Item>
        <List.Item><Link url="https://www.mercadopago.com/mlc/account/credentials?type=basic" external={true}>Chile</Link></List.Item>
        <List.Item><Link url="https://www.mercadopago.com/mco/account/credentials?type=basic" external={true}>Colombia</Link></List.Item>
        <List.Item><Link url="https://www.mercadopago.com/mlm/account/credentials?type=basic" external={true}>Mexico</Link></List.Item>
        <List.Item><Link url="https://www.mercadopago.com/mpe/account/credentials?type=basic" external={true}>Peru</Link></List.Item>
        <List.Item><Link url="https://www.mercadopago.com/mlu/account/credentials?type=basic" external={true}>Uruguay</Link></List.Item>
        <List.Item><Link url="https://www.mercadopago.com/mlv/account/credentials?type=basic" external={true}>Venezuela</Link></List.Item>
      </List>
    </div>
  );
}

export default CredentialsInfo;

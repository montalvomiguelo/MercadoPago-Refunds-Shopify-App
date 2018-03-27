# MercadoPago-Refunds-Shopify-App
Shopify App for easily performing Refunds &amp; Partial Refunds with MercadoPago 

## Add it to your shop
https://mercadopago-refunds.herokuapp.com/

After installing the App you will need to add your MercadoPago Credentials in _/preferences_

Get your CLIENT_ID and CLIENT_SECRET in the following address:
* Argentina: https://www.mercadopago.com/mla/herramientas/aplicaciones
* Brazil: https://www.mercadopago.com/mlb/ferramentas/aplicacoes
* México: https://www.mercadopago.com/mlm/herramientas/aplicaciones
* Venezuela: https://www.mercadopago.com/mlv/herramientas/aplicaciones
* Colombia: https://www.mercadopago.com/mco/herramientas/aplicaciones
* Chile: https://www.mercadopago.com/mlc/herramientas/aplicaciones

## Development
Install the app dependencies and start the app

```
bundle install
npm install
rackup
```

The embedded app sdk won't load non https content so you'll need to use a forwarding service like ngrok or forwardhq. Set your application url in the Shopify Partner area to your forwarded url. However The redirect_uri should still be http://localhost:9292/auth/shopify/callback which will allow you to install your app on a live shop while running it locally.

## Test
Running the tests
```
rake test:prepare
rake test
```

## Contributing

PRs welcome!




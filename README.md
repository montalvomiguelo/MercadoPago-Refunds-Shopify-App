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
Install the app dependencies

```
bundle install
npm install
```

Run the migrations

```
sequel -m db/migrate sqlite://db/development.sqlite3
```

Set env variables in .env file

```
SHOPIFY_API_KEY=23jordan
SHOPIFY_SHARED_SECRET=23jordan
DATABASE_URL='sqlite://db/development.sqlite3'
SECRET='This is a key that is 256 bits!!'
```

Start the app

```
rackup
```

Npm scripts (Webpack development & production)

```
npm run start
npm run build
```

The embedded app sdk won't load non https content so you'll need to use a forwarding service like ngrok or forwardhq. Set your application url in the Shopify Partner area to your forwarded url. However The redirect_uri should still be http://localhost:9292/auth/shopify/callback which will allow you to install your app on a live shop while running it locally.

## Test
Running the tests
```
rake test:prepare
rake test
```

## Deploy
This app was created with deploying to Heroku in mind.

Download the Heroku Toolbelt and run the following command to create a new application:

```
heroku apps:create <your new app name>
```

You will also need to add ClearDB(mysql) free add-on to your new Heroku app and then retrieve your DB url

```
heroku addons:create cleardb:ignite
heroku config | grep CLEARDB_DATABASE_URL
```

Set your env variables in Heroku
```
heroku config:set DATABASE_URL='mysql2://your-db-url'
heroku config:set SHOPIFY_API_KEY=jordan23
heroku config:set SHOPIFY_SHARED_SECRET=jordan23
heroku config:set SECRET='This is a key that is 256 bits!!'
```

Add nodejs build pack in Heroku

```
heroku buildpacks:add heroku/nodejs
```

Push to Heroku
```
git push heroku master
```

Run migrations in Heroku

```
heroku run sequel -m db/migrate mysql2://your-db-url
```

## Contributing

PRs welcome!




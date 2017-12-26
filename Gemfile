source 'https://rubygems.org'

gem 'sinatra'
gem 'sequel'
gem 'omniauth-shopify-oauth2'
gem "attr_encrypted", "~> 3.0.0"
gem 'shopify_api'
gem 'mercadopago-sdk'
gem 'will_paginate', '~> 3.1.0'
gem 'omniauth-shopify-oauth2'
gem 'monetize'

group :production do
  gem 'mysql2'
end

group :development, :test do
  gem 'sqlite3'
  gem 'pry-byebug'
end

group :development do
  gem 'dotenv'
end

group :test do
  gem 'rack-test'
  gem 'rspec'
end

source 'https://rubygems.org'

gem 'sinatra'
gem 'dotenv'
gem 'sequel'
gem 'omniauth-shopify-oauth2'
gem "attr_encrypted", "~> 3.0.0"

group :production do
  gem 'mysql2'
end

group :development, :test do
  gem 'sqlite3'
end

group :test do
  gem 'rack-test'
  gem 'rspec'
end

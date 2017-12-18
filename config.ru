require 'bundler'
Bundler.require(:default, ENV['RACK_ENV'])

require 'mercadopago'
require 'will_paginate/array'

Dotenv.load

DB = Sequel.connect(ENV['DATABASE_URL'], logger: Logger.new(STDOUT))

Dir[File.join(File.dirname(__FILE__), 'models', '*.rb')].each { |model| require model }
Dir[File.join(File.dirname(__FILE__), 'helpers', '*.rb')].each { |helper| require helper }
require './app'

run App

require 'bundler'
Bundler.require

require 'mercadopago'
require 'will_paginate/array'

Dotenv.load

DB = Sequel.connect(ENV['DATABASE_URL'], logger: Logger.new(STDOUT))

Dir[File.join(File.dirname(__FILE__), 'models', '*.rb')].each { |model| require model }
require './app'

run App

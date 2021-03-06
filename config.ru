require 'bundler'
Bundler.require(:default, ENV['RACK_ENV'])

require 'mercadopago'

if Gem::Specification.find_all_by_name('dotenv').any?
  Dotenv.load
end

DB = Sequel.connect(ENV['DATABASE_URL'], logger: Logger.new(STDOUT))

Dir[File.join(File.dirname(__FILE__), 'models', '*.rb')].each { |model| require model }
Dir[File.join(File.dirname(__FILE__), 'helpers', '*.rb')].each { |helper| require helper }
Dir[File.join(File.dirname(__FILE__), 'lib', '**/*.rb')].each { |file| require file }
require './app'

run App

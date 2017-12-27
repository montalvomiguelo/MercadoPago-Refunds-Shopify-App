ENV['RACK_ENV'] = 'test'
ENV['SECRET'] = 'secret'

require 'bundler'
Bundler.require(:default, ENV['RACK_ENV'])

require 'minitest/autorun'
require 'minitest/pride'
require 'mocha/setup'
require 'fakeweb'

require 'mercadopago'
require 'will_paginate/array'

file_path = File.expand_path('../../config/database.yml', __FILE__)
dbconfig = YAML.load_file(file_path)

DB = Sequel.connect(dbconfig[ENV['RACK_ENV']])

Dir[File.join(File.dirname(__FILE__), '../models', '*.rb')].each { |model| require model }
Dir[File.join(File.dirname(__FILE__), '../helpers', '*.rb')].each { |helper| require helper }
Dir[File.join(File.dirname(__FILE__), '../lib', '**/*.rb')].each { |file| require file }
require File.expand_path('../../app', __FILE__)

FakeWeb.allow_net_connect = false

module Helpers
  include Rack::Test::Methods

  def load_fixture(name)
    File.read("./test/fixtures/#{name}")
  end

  def fake(url, options = {})
    method = options.delete(:method) || :get
    body = options.delete(:body) || '{}'
    format = options.delete(:format) || :json

    FakeWeb.register_uri(method, url, { body: body, status: 200, content_type: "application/#{format}" }.merge(options))
  end
end

class Minitest::Test
  include Helpers
end

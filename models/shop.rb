class Shop < Sequel::Model
  plugin :validation_helpers
  plugin :update_or_create

  def self.secret
    @secret ||= ENV['SECRET']
  end

  def validate
    super
    validates_presence :name
    validates_presence :token if new?
  end

  attr_encrypted :token, key: secret
  attr_encrypted :mp_client_secret, key: secret
end

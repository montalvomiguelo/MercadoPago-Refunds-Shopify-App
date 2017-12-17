class Shop < Sequel::Model
  plugin :validation_helpers

  def self.secret
    @secret ||= ENV['SECRET']
  end

  def validate
    super
    validates_presence [:name, :token]
  end

  attr_encrypted :token, key: secret
  attr_encrypted :mp_client_secret, key: secret
end

FactoryGirl.define do
  to_create { |instance| instance.save }

  factory :shop
end

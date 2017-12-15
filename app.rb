class App < Sinatra::Base
  get '/install' do
    erb :install
  end
end

Sequel.migration do
  change do
    add_column :shops, :mp_client_id, String
    add_column :shops, :encrypted_mp_client_secret, String
    add_column :shops, :encrypted_mp_client_secret_iv, String
  end
end

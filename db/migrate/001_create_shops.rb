Sequel.migration do
  change do
    create_table(:shops) do
      primary_key :id
      String :name
      String :encrypted_token
      String :encrypted_token_iv
      index :name
    end
  end
end

class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :username
      t.string :email
      t.string :hashed_password
      t.string :salt
      t.string :lastfm_session_key
      t.string :lastfm_username

      t.timestamps
    end
  end
end

class CreatePlaylists < ActiveRecord::Migration
  def change
    create_table :playlists do |t|
      t.integer :user_id
      t.string :name
      t.integer :sort
      t.text :playlist_data

      t.timestamps
    end
  end
end

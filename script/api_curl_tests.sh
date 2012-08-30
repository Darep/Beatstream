
# PUT /nowplaying

curl -i "http://localhost:3000/api/v1/nowplaying" \
-X PUT -d "artist=Grandmaster Test&title=The Message" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# POST /scrobble

curl -i "http://localhost:3000/api/v1/scrobble" \
-X POST -d "artist=Grandmaster Test&title=The Message" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# GET /songs/play
curl -i "http://localhost:3000/api/v1/songs/play?file=ACDC%2FACDC%20-%20Thunderstruck.mp3" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# GET /songs
curl -i "http://localhost:3000/api/v1/songs" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# GET /playlists
curl -i "http://localhost:3000/api/v1/playlists" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# POST /playlists
curl -i "http://localhost:3000/api/v1/playlists" \
-X POST -d "name=Test list" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# PUT /playlists/:list_name
curl -i "http://localhost:3000/api/v1/playlists/Test%20list" \
-X PUT -d "name=Test list" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# DELETE /playlists/:list_name
curl -i "http://localhost:3000/api/v1/playlists/Test%20list" \
-X DELETE \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# GET /playlists/:list_name/songs
curl -i "http://localhost:3000/api/v1/playlists/Test%20list/songs" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# Add songs to playlist
# POST /playlists/:list_name/songs
curl -i "http://localhost:3000/api/v1/playlists/Test%20list/songs" \
-X POST -d "songs[]=test.mp3&songs[]=test2.mp3&songs[]=test3.mp3" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# Set songs on a playlist
# PUT /playlists/:list_name/songs
curl -i "http://localhost:3000/api/v1/playlists/Test%20list/songs" \
-X PUT -d "songs[]=test.mp3&songs[]=test2.mp3&songs[]=test3.mp3" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# POST /playlists/:list_name/songs/reoder
curl -i "http://localhost:3000/api/v1/playlists/Test%20list/songs/reorder" \
-X POST -d "songs[]=test3.mp3&songs[]=test2.mp3&songs[]=test.mp3" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

# PUT /songs
curl -i "http://localhost:3000/api/v1/songs" \
-X PUT -d "" \
-H "Cookie:_beat-stream_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFRkkiJThlNGY4YjFlNTc1MjNkYTQwNjI3MzRkN2Y1OTkzYTExBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVI0RENQbjlENGVuWTJBOFpWdVl2UlFXTTBqUU16emZQUEtBd3F2aUlPdmM9BjsARkkiDXVzZXJuYW1lBjsARkkiCXVzZXIGOwBUSSIMdXNlcl9pZAY7AEZpBg%3D%3D--fd6f887adb7cb7c4fb4d9e3abb7e7654db22cf9a"

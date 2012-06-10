require 'find'

class ApplicationController < ActionController::Base
	before_filter :authorize
	before_filter :redirect_to_https
	before_filter :load_sidebar_playlists
	protect_from_forgery

	protected

	def authorize
		unless User.find_by_id(session[:user_id])
			redirect_to login_url
		end
	end

	def redirect_to_https
		redirect_to :protocol => "https://" unless (request.ssl? || request.local?)
	end

	def load_sidebar_playlists
		user = User.find_by_id(session[:user_id])
		@playlists = []

		if user.nil?
			return
		end

		playlist_dir = 'public/playlists/' + user.username + '/'
		Find.find(playlist_dir) do |file|
			if File.directory?(file)
				next
			end

			playlist = file.sub!(playlist_dir, '')

			@playlists.push(playlist)
		end
	end
end

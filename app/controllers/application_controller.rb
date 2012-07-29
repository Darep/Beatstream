class ApplicationController < ActionController::Base
	before_filter :authorize
	before_filter :redirect_to_https
	#protect_from_forgery

	protected

	def authorize
		unless User.find_by_id(session[:user_id])
			redirect_to login_url
		end
	end

	def redirect_to_https
		redirect_to :protocol => "https://" unless (request.ssl? || request.local?)
	end
end

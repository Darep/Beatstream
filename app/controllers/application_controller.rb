class ApplicationController < ActionController::Base
  before_filter :authorize

  protected

    def authorize
      return true if Rails.env.test?

      redirect_to login_url if user.blank?
    end

    def user
      @user ||= User.find(session[:user_id]) if session[:user_id]
    end

end

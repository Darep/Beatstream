class SessionsController < ApplicationController
  skip_before_filter :authorize
  layout 'login'

  def new
  end

  def create
    if params[:password] && user = User.authenticate(params[:username], params[:password])
      session[:username] = user.username
      session[:user_id] = user.id
      redirect_to root_url
    else
      redirect_to login_url, :alert => "Oops! Now that wasn't right, was it?"
    end
  end

  def destroy
    session[:username] = nil
    session[:user_id] = nil
    redirect_to login_url
  end
end

module ApiV1
  class ApiController < ApplicationController
    before_filter :set_default_render_format

    rescue_from ActiveRecord::RecordNotFound do |exception|
      render_404(nil, exception.message)
    end

    def render_error(message, status = :unprocessable_entity)
      render :code => 422, :status => status, :json => { :error => message }
    end

    def render_errors(errors, status = :unprocessable_entity)
      render :code => 422, :status => status, :json => { :errors => errors }
    end

    def render_404(class_name = nil, message = nil)
      class_name ||= params[:controller].classify.demodulize.underscore

      render :json => {
        :code => 404,
        :errors => [message || "Couldn't find #{class_name} with id=#{params[:id]}"]
      }, :status => :not_found
    end

    def set_default_render_format
      request.format = :json
    end
  end
end

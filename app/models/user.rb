require 'digest/sha1'

class User < ActiveRecord::Base
    validates_length_of :login, :within => 2..40
end

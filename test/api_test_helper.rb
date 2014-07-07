# API test helpers
def get_json(url)
  get url, :format => :json
end

def post_json(url, data)
  post url, data.to_json, { 'CONTENT_TYPE' => 'application/json' }
end

def put_json(url, data)
  put url, data.to_json, { 'CONTENT_TYPE' => 'application/json' }
end

def delete_json(url)
  delete url, :format => :json
end

def post_multipart(url, data)
  post url, data, { 'CONTENT_TYPE' => 'multipart/form-data' }
end

def assert_put_json(url, data)
  put_json url, data
  res1 = json_response
  get_json url
  res2 = json_response
  assert_equal res1, res2
end

def json_response
  ActiveSupport::JSON.decode @response.body
end



class Error
  let _message: String val
  
  new create( message: String val ) =>
    _message = message
  
  fun string(): String val =>
    "{ \"message\": \"" + _message.clone() + "\" }"
    

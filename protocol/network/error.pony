

class Error
  let _message: String
  let _stack: String
  let _graph: String
  
  new create( message: String val, stack: String val, graph: String val  ) =>
    _message = message
    _stack = stack
    _graph = graph
    
  fun string(): String =>
    "{ " + 
    "\"message\": \"" + _message + "\"," +
    "\"stack\": \"" + _stack + "\"," +
    "\"graph\": \"" + _graph + "\"," +
    " }"
    

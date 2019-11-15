use http = "http"
use "logger"
use "net"
use "format"

use "../system"

actor RestServer
  
  new create( host': String, port': String, context: SystemContext ) =>
    context.log("Rest Server starting on: " + host' + ":" + port')
    let auth = context.auth()
    let logger:http.Logger = http.ContentsLog(context.stdout())
    
    http.HTTPServer(
      auth,
      ListenHandler(context),
      BackendMaker.create(context),
      logger
      where host=host', service=port', limit=50, reversedns=auth
    )
    
class ListenHandler
  let _context: SystemContext

  new iso create(context: SystemContext) =>
    _context = context

  fun ref listening(server: http.HTTPServer ref) =>
    try
      (let host, let service) = server.local_address().name()?
      _context(Info) and _context.log("connected: " + host)
    else
      _context(Error) and _context.log("Couldn't get local address.")
      server.dispose()
    end

  fun ref not_listening(server: http.HTTPServer ref) =>
    let local = server.local_address()
    _context(Error) and _context.log("Failed to listen. " )

  fun ref closed(server: http.HTTPServer ref) =>
    _context(Info) and _context.log("Shutdown.")

class BackendMaker is http.HandlerFactory
  let _context: SystemContext

  new val create(context: SystemContext) =>
    _context = context

  fun apply(session: http.HTTPSession): http.HTTPHandler^ =>
    BackendHandler.create(_context, session)

class BackendHandler is http.HTTPHandler
  """
  Notification class for a single HTTP session.  A session can process
  several requests, one at a time.  
  """
  let _context: SystemContext
  let _session: http.HTTPSession
  var _response: http.Payload = http.Payload.response()

  new ref create(context: SystemContext, session: http.HTTPSession) =>
    _context = context
    _session = session

  fun ref apply(request: http.Payload val) =>
    _response.add_chunk("You asked for ")
    _response.add_chunk(request.url.path)

    if request.url.query.size() > 0 then
      _response.add_chunk("?")
      _response.add_chunk(request.url.query)
    end

    if request.url.fragment.size() > 0 then
      _response.add_chunk("#")
      _response.add_chunk(request.url.fragment)
    end

    if request.method.eq("GET") then
      _session(_response = http.Payload.response())
    end

  fun ref chunk(data: ByteSeq val) =>
    """
    Process the next chunk of data received.
    """
    _response.add_chunk("\n")
    _response.add_chunk(data)

  fun ref finished() =>
    """
    Called when the last chunk has been handled.
    """
    _context(Fine) and _context.log("Finished")
    _session(_response = http.Payload.response())    

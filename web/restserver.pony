
use "../system"

use "files"
use "format"
use "http_server"
use "net"
use "debug"
use @fprintf[I32](stream: Pointer[U8] tag, fmt: Pointer[U8] tag, ...)
use @pony_os_stdout[Pointer[U8]]()

actor RestServer
  """
  Serve a single file over HTTP, possiblky chunked if it exceeds 4096 bytes (arbitrary choice just for this example).
  """
  new create( host: String, port: String, basedir:String, redirectTo:String, ctx: SystemContext ) =>
    ctx(Info) and ctx.log(Info, "Rest Server starting on: " + host + ":" + port.string() + ", basedir=" + basedir + "\n")
    let tcplauth = TCPListenAuth(ctx.auth())
    let fileauth = FileAuth(ctx.auth())
    let serverCfg = ServerConfig( where host' = host, port' = port, max_concurrent_connections' = 50)
    try
      let path = FilePath(fileauth, basedir).canonical()?
      let server = Server(TCPListenAuth(ctx.auth()), _LoggingServer(ctx), BackendMaker.create(ctx, path), serverCfg)
    else
      ctx(Error) and ctx.log(Error, basedir + " does not exist or is not readable")
    end

class _LoggingServer is ServerNotify
  """
  Notification class that is notified about
  important lifecycle events for the Server
  """
  let _ctx: SystemContext

  new iso create(ctx: SystemContext) =>
    Debug("Logging started")
    _ctx = ctx

  fun ref listening(server: Server ref) =>
    """
    Called when the Server starts listening on its host:port pair via TCP.
    """
    try
      (let host, let service) = server.local_address().name()?
      _ctx(Info) and _ctx.log(Info, "connected: " + host + ":" + service)
    else
      _ctx(Error) and _ctx.log(Error, "Couldn't get local address.")
      server.dispose()
    end

  fun ref not_listening(server: Server ref) =>
    """
    Called when the Server was not able to start listening on its host:port pair via TCP.
    """
    _ctx(Error) and _ctx.log(Error,"Failed to listen.")

  fun ref closed(server: Server ref) =>
    """
    Called when the Server is closed.
    """
    _ctx(Info) and _ctx.log(Info, "Shutdown.")

class BackendMaker is HandlerFactory
  """
  Fatory to instantiate a new HTTP-session-scoped backend instance.
  """
  let _ctx: SystemContext
  let _path: FilePath

  new val create(ctx: SystemContext, path: FilePath) =>
    Debug("BackendMaker.create():" + path.path)
    _ctx = ctx
    _path = path

  fun apply(session: Session): Handler^ =>
    Debug( "BackendMaker.apply()" + _path.path)
    BackendHandler.create(_ctx, session, _path)

class BackendHandler is Handler
  """
  Backend application instance for a single HTTP session.

  Executed on an actor representing the HTTP Session.
  That means we have 1 actor per TCP Connection
  (to be exact it is 2 as the TCPConnection is also an actor).
  """
  let _ctx: SystemContext
  let _session: Session
  let _file_sender: FileSender

  var _current: (Request | None) = None

  new ref create(ctx: SystemContext, session: Session, base_dir: FilePath) =>
    Debug("BackendHandler.create():" + base_dir.path)
    _ctx = ctx
    _session = session
    _file_sender = FileSender.create(session, base_dir)

  fun ref apply(request: Request val, request_id: RequestID) =>
    _current = request

  fun ref chunk(data: ByteSeq val, request_id:RequestID) =>
    // ignore request body
    None

  fun ref finished(request_id: RequestID) =>
    match _current
    | let request: Request =>
      if request.method() == GET then
        _file_sender.send_response(request_id, request)
      else
        let msg = "only GET is allowed"
        _session.send_raw(
          Responses.builder().set_status(StatusMethodNotAllowed)
            .add_header("Content-Type", "text/plain")
            .set_content_length(msg.size())
            .finish_headers()
            .add_chunk(msg)
            .build(),
          request_id
        )
        _session.send_finished(request_id)
      end
    else
      let msg = "Error opening file"
      _session.send_raw(
        Responses.builder().set_status(StatusInternalServerError)
          .add_header("Content-Type", "text/plain")
          .set_content_length(msg.size())
          .finish_headers()
          .add_chunk(msg)
          .build(),
        request_id
      )
      _session.send_finished(request_id)
    end
    _current = None

actor FileSender
  let _session: Session
  let _crlf: Array[U8] val
  let _chunk_size: USize = 8192
  let _base_dir:FilePath val

  var _content_type: String = ""
  var _current_file: (File | None) = None
  var _current_file_size: USize = 0
  var _chunked: (Chunked | None) = None

  new create(session: Session, base_dir: FilePath) =>
    _session = session
    _base_dir = base_dir
    _crlf = recover val [as U8: '\r'; '\n'] end

  fun _final() =>
    @fprintf[I32](@pony_os_stdout[Pointer[U8]](), "FileSender.final()\n".cstring())

  be send_response(request_id: RequestID, request:Request) =>
    var path_part = request.uri().path
    if path_part.at("/assets/") then
      path_part = path_part.substring(1)
    elseif path_part == "favicon.ico" then
      path_part = "favicon.ico"
    else
      path_part = "index.html"
    end
    Debug("BackendHandler.send_response():" + path_part)
    let file_path = try _base_dir.join(path_part)? else
      Debug("BackendHandler.send_response(): Can't join " + path_part + " to " + _base_dir.path )
      _base_dir
    end
    _current_file = try OpenFile(file_path) as File else None end
    _content_type = MimeTypes(file_path.path)
    _current_file_size = try (_current_file as File).size() else 0 end
    _chunked = if _current_file_size > _chunk_size then Chunked else None end

    match _chunked
    | Chunked =>
      send_chunked_response(request_id)
    | None =>
      send_oneshot_response(request_id)
    end

  fun ref send_chunked_response(request_id: RequestID) =>
    Debug("BackendHandler.send_chunked_response()")
    try
      let response = BuildableResponse
      response.set_transfer_encoding(_chunked)
      response.set_header("Content-Type", _content_type)
      _session.send_start(consume response, request_id)
      (_current_file as File).seek_start(0)
      this.send_chunked_chunk(request_id)
    else
      this.send_error(request_id)
    end

  be send_chunked_chunk(request_id: RequestID) =>
    try
      let file = _current_file as File
      let file_chunk = file.read(_chunk_size)
      if file_chunk.size() == 0 then
        // send last chunk
        let last_chunk = (recover val Format.int[USize](0 where fmt = FormatHexBare).>append(_crlf).>append(_crlf) end).array()
        _session.send_chunk(last_chunk, request_id)
        // finish sending
        _session.send_finished(request_id)
      else
        // manually form a chunk
        let chunk_prefix = (recover val Format.int[USize](file_chunk.size() where fmt = FormatHexBare).>append(_crlf) end).array()
        _session.send_chunk(chunk_prefix, request_id)
        _session.send_chunk(consume file_chunk, request_id)
        _session.send_chunk(_crlf, request_id)
        send_chunked_chunk(request_id)
      end
    else
      this.send_error(request_id)
    end

  fun ref send_oneshot_response(request_id: RequestID) =>
    let response = BuildableResponse
    response.set_content_length(_current_file_size)
    response.set_header("Content-Type", _content_type)
    _session.send_start(consume response, request_id)
    try
      (_current_file as File).seek_start(0)
      this.send_oneshot_chunk(request_id)
    else
      this.send_error(request_id)
    end

  be send_oneshot_chunk(request_id: RequestID) =>
    Debug("BackendHandler.send_oneshot_chunk()")
    try
      let file = _current_file as File
      let file_chunk = file.read(_current_file_size) // just read as much as we can get
      if file_chunk.size() == 0 then
        _session.send_finished(request_id)
      else
        _session.send_chunk(consume file_chunk, request_id)
        this.send_oneshot_chunk(request_id)
      end
    else
      this.send_error(request_id)
    end

  be send_error(request_id: RequestID) =>
    Debug("BackendHandler.send_error()")
    let msg = "Error reading from file"
    _session.send_raw(
      Responses.builder().set_status(StatusInternalServerError)
        .add_header("Content-Type", "text/plain")
        .set_content_length(msg.size())
        .finish_headers()
        .add_chunk(msg)
        .build(),
      request_id
    )
    _session.send_finished(request_id)
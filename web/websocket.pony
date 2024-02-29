
use "jay"
use "websocket"
use "collections"
use "../graphs"
use "../blocktypes"
use "../protocol"
use "../protocol/network"
use "../system"

class val ListenNotify is WebSocketListenNotify
  let _fbp: Fbp val
  let _context: SystemContext
  
  new iso create( fbp: Fbp val, context:SystemContext) =>
    _context = context
    _context(Info) and _context.log(Info, "Created websocket" )
    _fbp = fbp
    
  fun ref connected(): _ConnectionNotify iso^ =>
    _context(Info) and _context.log(Info, "Connected websocket..." )
    _ConnectionNotify.create(_fbp, _context)

  fun ref not_listening() =>
    _context(Info) and _context.log(Info, "Stopped listening on websocket" )

    
class _ConnectionNotify is WebSocketConnectionNotify
  let _context:SystemContext
  let _fbp: Fbp val
  var _connection: (WebSocketConnection | None) = None
  var _sender: (WebSocketSender | None) = None

  new iso create( fbp: Fbp val, context:SystemContext ) =>
    _context = context
    _context(Info) and _context.log(Info, "Created websocket" )
    _fbp = fbp

  fun ref opened(conn: WebSocketConnection ref) =>
    _context(Info) and _context.log(Info, "Opened websocket" )
    _connection = conn
    let sender = WebSocketSender(conn, _context)
    _sender = sender
    _fbp.subscribe( sender )

  fun ref text_received(conn: WebSocketConnection ref, text: String) =>
    _context(Info) and _context.log(Info, "  ==> " + text )
    match _sender
    | let sender:WebSocketSender =>
      _fbp.execute( sender, text )
    else
      _context(Error) and _context.log( Error, "Internal error?" )
    end

  fun ref binary_received(conn: WebSocketConnection ref, data: Array[U8] val) =>
    _context(Info) and _context.log(Info, "binary_received" )
    match _sender
    | let sender:WebSocketSender =>
      ErrorMessage( sender, None, "Binary formats are not supported.", true )
    else
      _context(Error) and _context.log( Error, "Internal error?" )
    end

  fun ref closed(conn: WebSocketConnection ref) =>
    _context(Info) and _context.log(Info, "Closed websocket" )
    match _sender
    | let sender:WebSocketSender =>
      _fbp.closing( sender )
    else
      _context(Error) and _context.log( Error, "Internal error?" )
    end
    _connection = None
    _sender = None
  
class val WebSocketSender is (Equatable[WebSocketSender] & Hashable)
  let _connection:WebSocketConnection
  let _context:SystemContext

  new val create(connection:WebSocketConnection, context:SystemContext) =>
    _connection = connection
    _context = context
    
  fun send_text(text: String val, log:Bool = true) =>
    if log then
      _context(Info) and _context.log(Info, "  <== " + text )
    end
    _connection.send_text(text)

  fun send_binary(data: Array[U8] val) =>
    _connection.send_binary(data)
  
  fun box eq(that: box->WebSocketSender): Bool val =>
    _connection is that._connection

  fun box ne(that: box->WebSocketSender): Bool val =>
    not (_connection is that._connection)

  fun hash(): USize val =>
    // TODO: This is horrible, but since we won't have many connections at the same time, and the hashmap usage isn't
    // in the critical path, I think it is good enough for now.
    USize(1)

use "jay"
use "websocket"
use "collections"
use "../graphs"
use "../blocktypes"
use "../protocol"
use "../system"

class val ListenNotify is WebSocketListenNotify
  let _fbp: Fbp val
  let _context: SystemContext
  
  new iso create( fbp: Fbp val, context:SystemContext) =>
    _context = context
    _context.log( "Created websocket" )
    _fbp = fbp
    
  fun ref connected(): _ConnectionNotify iso^ =>
    _context.log( "Connected websocket..." )
    _ConnectionNotify.create(_fbp, _context)

  fun ref not_listening() =>
    _context.log( "Stopped listening on websocket" )


class _ConnectionNotify is WebSocketConnectionNotify
  let _fbp: Fbp val
  var _connection: (WebSocketConnection | None) = None
  let _context:SystemContext
  
  new iso create( fbp: Fbp val, context:SystemContext ) =>
    _context = context
    _context.log( "Created websocket" )
    _fbp = fbp

  fun ref opened(conn: WebSocketConnection ref) =>
    _context.log( "Opened websocket" )
    _connection = conn
    _fbp.subscribe( WebSocketSender(conn, _context) )

  fun ref text_received(conn: WebSocketConnection ref, text: String) =>
    _context.log( "  ==> " + text )
    _fbp.execute( WebSocketSender(conn, _context), text )

  fun ref binary_received(conn: WebSocketConnection ref, data: Array[U8] val) =>
    _context.log( "binary_received" )
    conn.send_text( Message.err( "unknown",  "Binary formats not supported").string() )

  fun ref closed(conn: WebSocketConnection ref) =>
    _context.log( "Closed websocket" )
    _fbp.unsubscribe( WebSocketSender(conn, _context) )
    _connection = None

class val WebSocketSender is Equatable[WebSocketSender]
  let _connection:WebSocketConnection
  let _context:SystemContext
  
  new val create(connection:WebSocketConnection, context:SystemContext) =>
    _connection = connection
    _context = context
    
  fun send_text(text: String val) =>
    _context.log( "\n  <== " + text )
    _connection.send_text(text)

  fun send_binary(data: Array[U8] val) =>
    _connection.send_binary(data)
  
  fun box eq(that: box->WebSocketSender): Bool val =>
    _connection is that._connection

  fun box ne(that: box->WebSocketSender): Bool val =>
    not (_connection is that._connection)


use "jay"
use "websocket"
use "collections"
use "../graphs"
use "../blocktypes"
use "../protocol"

class val ListenNotify is WebSocketListenNotify
  let _fbp: Fbp val
  
  new iso create( fbp: Fbp val) =>
    _fbp = fbp
    
  fun ref connected(): ConnectionNotify iso^ =>
    @printf[I32]("Connected\n".cstring())
    ConnectionNotify.create(_fbp)

  fun ref not_listening() =>
    @printf[I32]("Stopped listening\n".cstring())

class ConnectionNotify is WebSocketConnectionNotify
  let _fbp: Fbp val
  var _connection: (WebSocketConnection | None) = None
  
  new iso create( fbp: Fbp val ) =>
    @printf[I32]("Created\n".cstring())
    _fbp = fbp

  fun ref opened(conn: WebSocketConnection ref) =>
    @printf[I32]("Opened\n".cstring())
    _connection = conn
    _fbp.subscribe( conn )

  fun ref text_received(conn: WebSocketConnection ref, text: String) =>
    @printf[I32](("  ==>" + text + "\n").cstring())
    _fbp.execute( conn, text )

  fun ref binary_received(conn: WebSocketConnection ref, data: Array[U8] val) =>
    @printf[I32](("binary_received: \n").cstring())
    conn.send_text( Message.err( "unknown",  "Binary formats not supported").string() )

  fun ref closed(conn: WebSocketConnection ref) =>
    @printf[I32]("Closed\n".cstring())
    _fbp.unsubscribe( conn )
    _connection = None
    

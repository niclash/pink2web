
use "jay"
use "websocket"
use "collections"
use "../graphs"
use "../blocktypes"
use "../protocol"

class val BroadcastListenNotify is WebSocketListenNotify
  let _fbp: Fbp tag
  
  new iso create( graphs: Graphs, blocktypes: BlockTypes val) =>
    _fbp = Fbp( "619362b3-1aee-4dca-b109-bef38e0e1ca8", graphs, blocktypes )
    
  fun ref connected(): BroadcastConnectionNotify iso^ =>
    @printf[I32]("Connected\n".cstring())
    BroadcastConnectionNotify.create(_fbp)

  fun ref not_listening() =>
    @printf[I32]("Stopped listening\n".cstring())

class BroadcastConnectionNotify is WebSocketConnectionNotify
  let _fbp: Fbp tag
  
  new iso create( fbp: Fbp tag ) =>
    @printf[I32]("Created\n".cstring())
    _fbp = fbp

  fun ref opened(conn: WebSocketConnection ref) =>
    @printf[I32]("Opened\n".cstring())

  fun ref text_received(conn: WebSocketConnection ref, text: String) =>
    @printf[I32](("  ==>" + text + "\n").cstring())
    _fbp.execute( conn, text )

  fun ref binary_received(conn: WebSocketConnection ref, data: Array[U8] val) =>
    @printf[I32](("binary_received: \n").cstring())
    conn.send_text( Message.err( "unknown",  "Binary formats not supported").string() )

  fun ref closed(conn: WebSocketConnection ref) =>
    @printf[I32]("Closed\n".cstring())

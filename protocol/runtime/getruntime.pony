use "jay"
use "websocket"

primitive GetRuntimeMessage

  fun apply( connection: WebSocketConnection, runtime: RuntimeMessage ) =>
    connection.send_text( runtime.string() )


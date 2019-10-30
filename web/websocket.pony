
use "websocket"
use "collections"

actor ConnectionManager
  var _connections: SetIs[WebSocketConnection] = SetIs[WebSocketConnection]()

  be add(conn: WebSocketConnection) =>
    @printf[I32]("Add connection\n".cstring())
    _connections.set(conn)

  be remove(conn: WebSocketConnection) =>
    @printf[I32]("Remove connection\n".cstring())
    _connections.unset(conn)

  be broadcast_text(text: String) =>
    @printf[I32](("broadcast_text"+text+"\n").cstring())
    for c in _connections.values() do
      c.send_text_be(text)
    end

  be broadcast_binary(data: Array[U8] val) =>
    @printf[I32]("broadcast_binary\n".cstring())
    for c in _connections.values() do
      c.send_binary_be(data)
    end

class BroadcastListenNotify is WebSocketListenNotify
  var _conn_manager: ConnectionManager = ConnectionManager.create()

  fun ref connected(): BroadcastConnectionNotify iso^ =>
    @printf[I32]("Connected\n".cstring())
    BroadcastConnectionNotify(_conn_manager)

  fun ref not_listening() =>
    @printf[I32]("Failed listening\n".cstring())

class BroadcastConnectionNotify is WebSocketConnectionNotify
  var _conn_manager: ConnectionManager

  new iso create(conn_manager: ConnectionManager) =>
    @printf[I32]("Created\n".cstring())
    _conn_manager = conn_manager

  fun ref opened(conn: WebSocketConnection tag) =>
    @printf[I32]("Opened\n".cstring())
    _conn_manager.add(conn)

  fun ref text_received(conn: WebSocketConnection tag, text: String) =>
    @printf[I32](("text_received: " + text + "\n").cstring())
    _conn_manager.broadcast_text(text)

  fun ref binary_received(conn: WebSocketConnection tag, data: Array[U8] val) =>
    @printf[I32](("binary_received: \n").cstring())
    _conn_manager.broadcast_binary(data)

  fun ref closed(conn: WebSocketConnection tag) =>
    @printf[I32]("Closed\n".cstring())
    _conn_manager.remove(conn)


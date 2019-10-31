
use "jay"
use "websocket"


class GraphProtocol is FbpProtocol

  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    @printf[I32](("network protocol: " + command + ", " + payload.string() + "\n").cstring())
    match command
    |   "clear" => None
    |   "addnode" => None
    |   "removenode" => None
    |   "renamenode" => None
    |   "changenode" => None
    |   "addedge" => None
    |   "removeedge" => None
    |   "changeedge" => None
    |   "addinitial" => None
    |   "removeinitial" => None
    |   "addinport" => None
    |   "removeinport" => None
    |   "renameinport" => None
    |   "addoutport" => None
    |   "removeoutport" => None
    |   "renameoutport" => None
    |   "addgroup" => None
    |   "removegroup" => None
    |   "renamegroup" => None
    |   "changegroup" => None
    else
      connection.send_text( Error("Unknown command in runtime protocol").string() )
    end

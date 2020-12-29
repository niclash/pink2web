
use "../web"
use "../protocol/network"

actor RemoteOutStream is OutStream
  let _local:OutStream
  let _connections: Array[WebSocketSender] ref = Array[WebSocketSender]
  let _stderr:Bool

  new create( local:OutStream, stderr:Bool ) =>
    _local = local
    _stderr = stderr

  be print( data: (String val | Array[U8 val] val)) =>
    _local.print( data )
    _send(_to_string(data))

  be write( data: (String val | Array[U8 val] val)) =>
    _local.write( data )
    _send(_to_string(data))

  be printv( data: ByteSeqIter val) =>
    _local.printv( data )
    _send(_to_string(data))

  be writev( data: ByteSeqIter val) =>
    _local.writev( data )
    _send(_to_string(data))

  be flush() =>
    _local.flush()

  be add_remote( socket:WebSocketSender ) =>
    _connections.push( socket )

  be remove_remote( socket:WebSocketSender ) =>
    var index:USize = 0
    while index < _connections.size() do
      try
        if _connections(index)? == socket then
          _connections.remove(index,1)
        end
      end
      index = index + 1
    end

  fun _send( message: String val ) =>
    for socket in _connections.values() do
      if _stderr then
        ErrorMessage( socket, None, message, false )
      else
        OutputMessage( socket, message, false )
      end
    end

  fun _to_string(data: (String val | Array[U8 val] val | ByteSeqIter val)): String val =>
    match data
    | let d:String val => d
    | let d:Array[U8 val] val => String.from_array(d)
    | let d:ByteSeqIter val => var result = "" ; for x in d.values() do result = result + _to_string(x) end; result
    end

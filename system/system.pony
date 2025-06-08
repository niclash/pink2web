use "files"
use "jay"
use "time"
use "collections"
use "../web"

class val SystemContext
  let timers:Timers
  let _filelocations:FileLocations val
  let _auth: AmbientAuth
  let _remote_out: RemoteOutStream
  let _remote_err: RemoteOutStream
  let _logger:_Logger
  let _stdout: OutStream
  let _stderr: OutStream
  let _io:Io tag

  new val create(auth':AmbientAuth, stdout':OutStream, stderr':OutStream, level:LogLevel, base_dir:FilePath, conf_dir:FilePath, io':Io tag, remote_log:Bool = false) =>
    _auth = auth'
    _io = io'
    timers = Timers(20) // ~millisecond resolution
    _stdout = stdout'
    _stderr = stderr'
    _filelocations = recover val FileLocations(base_dir, conf_dir) end
    _remote_out = RemoteOutStream( stdout', false )
    _remote_err = RemoteOutStream( stderr', true )
    if remote_log then
      _logger = _Logger( _remote_out, _remote_err, level )
    else
      _logger = _Logger( _stdout, _stderr, level )
    end

  fun name(): String val => "pink2web"

  fun stdout(): OutStream => _stdout
  
  fun stderr(): OutStream => _stderr
  
  fun box to_stdout( text: String ) => _stdout.print( text )
    
  fun box to_stderr( text: String ) => _stderr.print( text )

  fun val filelocations(): FileLocations => _filelocations

  fun val io() => _io

  fun box apply(level: LogLevel) : Bool val => _logger(level)

  fun box log( level:LogLevel, value:String, loc:SourceLoc val = __loc): Bool => _logger.log(level,value, loc)

  fun internal_error() => _logger.log( Error, "INTERNAL ERROR!!!" )

  fun val auth(): AmbientAuth val => _auth

  fun add_remote( socket:WebSocketSender ) =>
    _remote_out.add_remote( socket )
    _remote_err.add_remote( socket )

  fun remove_remote( socket:WebSocketSender ) =>
    _remote_out.remove_remote( socket )
    _remote_err.remove_remote( socket )

  fun formatMap(data:Map[String val,String val] box): String val=>
    var result = String
    result.reserve(data.size()*100)
    for c in data.pairs() do
      result.append("    " + c._1 +":" + c._2 )
    end
    recover val
      result.string()
    end

class val FileLocations
  let base_directory:FilePath
  let config_directory:FilePath
  let graph_directory:FilePath

  new create( base_dir':FilePath, conf_dir':FilePath ) =>
    base_directory = base_dir'
    config_directory = conf_dir'
    try
      if not base_directory.exists() then
        base_directory.mkdir()
      end
      if not base_directory.exists() then
        Fail()
      end
      graph_directory = base_dir'.join( "graphs" )?
      if not graph_directory.exists() then
        graph_directory.mkdir()
      end
    else
      graph_directory = base_directory
      Fail()
    end

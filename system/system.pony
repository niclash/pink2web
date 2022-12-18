use "files"
use "jay"
use "raspi"
use "time"
use "../web"

class val SystemContext
  let _timers:Timers
  let _filelocations:FileLocations
  let _auth: AmbientAuth
  let _remote_out: RemoteOutStream
  let _remote_err: RemoteOutStream
  let _logger:_Logger
  let _stdout: OutStream
  let _stderr: OutStream

  new val create(auth':AmbientAuth, stdout':OutStream, stderr':OutStream, level:LogLevel, base_dir:FilePath, remote_log:Bool = false) =>
    _auth = auth'
    _timers = Timers
    _stdout = stdout'
    _stderr = stderr'
    _filelocations = FileLocations(base_dir)
    _remote_out = RemoteOutStream( stdout', false )
    _remote_err = RemoteOutStream( stderr', true )
    if remote_log then
      _logger = _Logger( _remote_out, _remote_err, level )
    else
      _logger = _Logger( _stdout, _stderr, level )
    end

  fun stdout(): OutStream => _stdout
  
  fun stderr(): OutStream => _stderr
  
  fun box to_stdout( text: String ) =>
    _stdout.print( text )
    
  fun box to_stderr( text: String ) =>
    _stderr.print( text )

  fun val filelocations(): FileLocations =>
    _filelocations

  fun box apply(level: LogLevel) : Bool val =>
    _logger(level)

  fun box log( level:LogLevel, value:String, loc:SourceLoc val = __loc): Bool =>
    _logger.log(level,value, loc)

  fun internal_error() =>
    _logger.log( Error, "INTERNAL ERROR!!!" )

  fun val auth(): AmbientAuth val =>
    _auth

  fun val timers(): Timers =>
    _timers

  fun add_remote( socket:WebSocketSender ) =>
    _remote_out.add_remote( socket )
    _remote_err.add_remote( socket )

  fun remove_remote( socket:WebSocketSender ) =>
    _remote_out.remove_remote( socket )
    _remote_err.remove_remote( socket )

class val FileLocations
  let base_directory:FilePath
  let graph_directory:FilePath

  new create( base_dir':FilePath ) =>
    base_directory = base_dir'
    try
      if not base_directory.exists() then
        base_directory.mkdir()
      end
      graph_directory = base_dir'.join( "graphs" )?
      if not graph_directory.exists() then
        graph_directory.mkdir()
      end
    else
      graph_directory = base_directory
      Fail()
    end

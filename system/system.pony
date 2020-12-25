use "logger"
use "time"

class val SystemContext
  let logger:Logger[String] val
  let _timers:Timers
  let _env: Env
  let _auth: AmbientAuth
  
  new val create( env: Env, level':LogLevel )? =>
    _auth = try
       env.root as AmbientAuth
    else
      Fail()
      error
    end
    
    // TODO: add -v for Warn, -vv for Info and -vvv for Fine logging levels
    //       The SystemContext is created before handling of CLI, so it needs to scan 
    //       manually.
    var level:LogLevel = level'
    for arg in env.args.values() do 
      match arg
      | "--warn" => level = Warn
      | "--info" => level = Info
      | "--fine" => level = Fine
      end
    end
    _timers = Timers
    logger = StringLogger( level, env.err )    
    _env = env
    
// Logger[String] decorator
  fun box apply( level: (Fine val | Info val | Warn val | Error val)) : Bool val =>
    logger.apply(level)
    
  fun box log( value: String, loc: SourceLoc val = __loc) : Bool val =>
    logger.log( value, loc )

  fun stdout(): OutStream => _env.out
  
  fun stderr(): OutStream => _env.err
  
  fun box to_stdout( text: String ) =>
    _env.out.print( text )
    
  fun box to_stderr( text: String ) =>
    _env.err.print( text )
    
  fun internal_error() =>
    log( "INTERNAL ERROR!!!" )

  fun val auth(): AmbientAuth val =>
    _auth

  fun val timers(): Timers =>
    _timers

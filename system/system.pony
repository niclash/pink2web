use "logger"
use "time"

class val SystemContext
  let _logger:Logger[String] val
  let _timers:Timers
  let _env: Env
  
  new val create( env: Env, level':LogLevel ) =>
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
    _logger = StringLogger( level, env.out )    
    _env = env
    
// Logger[String] decorator
  fun box apply( level: (Fine val | Info val | Warn val | Error val)) : Bool val =>
    _logger.apply(level)
    
  fun box log( value: String, loc: SourceLoc val = __loc) : Bool val =>
    _logger.log( value, loc )

  fun box stdout( text: String ) =>
    _env.out.print( text )
    
  fun box stderr( text: String ) =>
    _env.err.print( text )
    
  fun internal_error() =>
    log( "INTERNAL ERROR!!!" )

  fun val ambient(): (AmbientAuth val| None) =>
    _env.root

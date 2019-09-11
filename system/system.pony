use "logger"
use "time"

class SystemContext
  let _logger:Logger[String] val
  let _timers:Timers
  
  new create( env: Env ) =>
    _timers = Timers
    _logger = StringLogger( Info, env.out )    
    
    
// Logger[String] decorator
  fun box apply( level: (Fine val | Info val | Warn val | Error val)) : Bool val =>
    _logger.apply(level)
    
  fun box log( value: String, loc: SourceLoc val = __loc) : Bool val =>
    _logger.log( value, loc )

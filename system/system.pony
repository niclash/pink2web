use "logger"
use "time"

class SystemContext
  let logger:Logger[String]
  let timers:Timers
  
  new create( env: Env ) =>
    timers = Timers
    logger = StringLogger( Info, env.out )    
    
    
// Logger[String] decorator
  fun box apply( level: (Fine val | Info val | Warn val | Error val)) : Bool val =>
    log.apply(level)
    
  fun box log( value: String, loc: SourceLoc val = __loc) : Bool val =>
    log.log( value, loc )


use "time"

interface val GraphNotify is Equatable[GraphNotify]

  fun added_block(graph:String, block:String, component:String, x:I64, y:I64)
  
  fun renamed_block(graph:String, from:String, to:String)

  fun changed_block(graph:String, block:String, x:I64, y:I64)
  
  fun removed_block(graph:String, block:String)

  fun started(graph: String, time_started:PosixDate val, started':Bool, running:Bool, debug:Bool)
  
  fun stopped(graph: String, time_started:PosixDate val, uptime:I64, started':Bool, running:Bool, debug:Bool)
  
  fun status(graph: String, uptime:I64, started':Bool, running:Bool, debug:Bool )

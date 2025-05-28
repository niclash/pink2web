
use "metric"
use "time"

trait val GraphNotify is Equatable[GraphNotify]

  fun err( type':String, message:String )
  
  fun added_block(graphid:String, block:String, component:String, x:F64, y:F64)
  
  fun renamed_block(graphid:String, from:String, to:String)

  fun changed_block(graphid:String, block:String, x:F64, y:F64)
  
  fun removed_block(graphid:String, block:String)

  fun added_connection(graphid:String, from_block:String, from_output:String, to_block:String, to_input:String)
  
  fun removed_connection(graphid:String, from_block:String, from_output:String, to_block:String, to_input:String)

  fun added_initial(graphid:String, initial_value:(String|I64|F64|Metric|Bool), to_block:String, to_input:String)

  fun removed_initial(graphid:String, initial_value:(String|I64|F64|Metric|Bool), to_block:String, to_input:String)

  fun created_graph(name:String, description:String, graphid:String, icon:String)

  fun deleted_graph(graphid:String, name:String)

  fun started(graphid: String, time_started:PosixDate val, started':Bool, running:Bool, debug:Bool)
  
  fun stopped(graphid: String, time_started:PosixDate val, uptime:I64, started':Bool, running:Bool, debug:Bool)
  
  fun status(graphid: String, name':String, descr':String, uptime:I64, started':Bool, running:Bool, debug:Bool )


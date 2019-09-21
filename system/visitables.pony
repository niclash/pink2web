use "collections"
use "promises"

trait CVisitable[TYPE: Any val]
  fun visit(): TYPE
  
trait AVisitable[TYPE: Any val]
  be visit( promise: Promise[ TYPE ] val )
  

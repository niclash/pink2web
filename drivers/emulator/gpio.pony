use "collections"
use "metric"
use "raspi"
use "../../blocktypes"

class val EmulGpioInputAlgorithm is CyclicAlgorithm
  fun val apply( block:CyclicBlock, inputs:Map[String,(String|I64|F64|Metric|Bool)] val, now:U64, last:U64 ) =>
      None

class val EmulGpioOutputAlgorithm is Algorithm
  fun val apply( block:GenericBlock, inputs:Map[String,(String|I64|F64|Metric|Bool)] val ) =>
      None

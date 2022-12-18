use "collections"
use "metric"
use "raspi"
use "../../blocktypes"

class val GpioInputAlgorithm is CyclicAlgorithm
  fun val apply( block:CyclicBlock, inputs:Map[String,(String|I64|F64|Metric|Bool)] val, now:U64, last:U64 ) =>
    try
      let pin = inputs("pin")? as I64
      RPi.pinMode(pin.i32(),INPUT)
      let input:IoState = RPi.digitalRead(pin.i32())
      block.update("out", if input is HIGH then true else false end )
    else
      // TODO: Some error indicator somehow/somewhere
      None
    end

class val GpioOutputAlgorithm is Algorithm
  fun val apply( block:GenericBlock, inputs:Map[String,(String|I64|F64|Metric|Bool)] val ) =>
    try
      let pin = inputs("pin")? as I64
      RPi.pinMode(pin.i32(),OUTPUT)
      let value = inputs("in")? as Bool
      RPi.digitalWrite(pin.i32(), if value then HIGH else LOW end )
    else
    // TODO: Some error indicator somehow/somewhere
      None
    end

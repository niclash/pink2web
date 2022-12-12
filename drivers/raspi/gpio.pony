use "collections"
use "raspi"
use "../../blocktypes"

class val GpioInputAlgorithm is CyclicAlgorithm
  fun val apply( block:CyclicBlock, inputs:Map[String,Any val] val, now:U64, last:U64 ) =>
    try
      let pin = inputs("pin")? as I32
      RPi.pinMode(pin,INPUT)
      let input:IoState = RPi.digitalRead(pin)
      block.update("out", if input is HIGH then true else false end )
    end

class val GpioOutputAlgorithm is Algorithm
  fun val apply( block:GenericBlock, inputs:Map[String,Any val] val ) =>
    try
      let pin = inputs("pin")? as I32
      RPi.pinMode(pin,OUTPUT)
      try
        let value = inputs("in")? as Bool
        RPi.digitalWrite(pin, if value then HIGH else LOW end )
      end
    end

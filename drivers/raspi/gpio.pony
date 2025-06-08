use "collections"
use "gpiod"
use "../../blocktypes"
use "../../system"

class val RaspiGpioInputAlgorithm is CyclicAlgorithm
  fun val apply( block:CyclicBlock, inputs:Map[String,Linkable] val, now:U64, last:U64 ) =>
    """
    """

class val RaspiGpioOutputAlgorithm is Algorithm
  fun val apply( block:GenericBlock, inputs:Map[String,Linkable] val ) =>
    """
    """
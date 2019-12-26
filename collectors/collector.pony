
use "promises"

interface val Collectable[IN:Any #alias, OUT:Any #share]
  fun apply( c:IN, p:Promise[OUT] )

interface val Reducable[OUT:Any #share]
  fun apply( c: Array[OUT] val)
  
primitive Collector[IN:Any #alias, OUT:Any #share]
  fun apply( collection':Iterator[IN], fetch:Collectable[IN,OUT], reduce:Reducable[OUT] ) =>
    let promises = Array[Promise[OUT]]
    for c in collection' do
      let p = Promise[OUT]
      fetch(c,p)
      promises.push(p)
    end
    try
      let root = promises.pop()?
      let fulfill: Fulfill[Array[OUT] val, None] =  { (result: Array[OUT] val ) => reduce(result) }
      root.join( promises.values() ).next[None]( consume fulfill )
    else
      reduce(recover Array[OUT] end)
    end

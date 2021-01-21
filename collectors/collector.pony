
use "promises"

interface val Collectable[IN:Any #alias, OUT:Any #share]
  fun apply( c:IN, p:Promise[OUT] )

type Reducable[OUT:Any #share] is Fulfill[Array[OUT] val, None val]

primitive Collector[IN:Any #alias, OUT:Any #share]
  fun apply( collection':Iterator[IN], fetch:Collectable[IN,OUT], reduce:Reducable[OUT] iso ) =>
    let promises = Array[Promise[OUT]]
    for c in collection' do
      let p = Promise[OUT]
      fetch(c,p)
      promises.push(p)
    end
    let p = Promises[OUT].join(promises.values())
    p.next[None]( consume reduce )

interface StringCollector
  fun apply( s:String val )

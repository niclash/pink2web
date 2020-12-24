use "promises"
use "pony-metric"

primitive PReal is Stringable
  fun string(): String iso^ => "real".string()
  
primitive PBoolean is Stringable
  fun string(): String iso^ => "bool".string()

primitive PText is Stringable
  fun string(): String iso^ => "string".string()

type LinkType is (PReal | PBoolean | PText )

primitive LinkTypeList
  fun tag apply(): Array[LinkType] =>
    [PReal; PBoolean; PText]

type Linkable is ( Float val | Signed val | Metric val | Bool val | String val | None val)

primitive FNum
  fun apply( value:Linkable):F64 =>
    match value
    | let v:Float => v.f64()
    | let v:Signed => v.f64()
    | let v:Metric => v.value()
    | let v:Bool => if v then 1.0 else 0.0 end
    | let v:String => try v.f64()? else 0 end
    else
      0
    end

primitive INum
  fun apply( value:Linkable):I64 =>
    match value
    | let v:Float => v.i64()
    | let v:Signed => v.i64()
    | let v:Metric => v.value().i64()
    | let v:Bool => if v then 1 else 0 end
    | let v:String => try v.i64()? else 0 end
    else
      0
    end

class Link[TYPE: Linkable val]
  let block: Block tag
  let input: String
  
  new create( dest_block: Block tag, dest_input: String ) =>
    block = dest_block
    input = dest_input
    
  fun update( new_value: Linkable ) =>
    block.update(input, new_value )
  
  fun describe( promise: Promise[String] tag ) =>
    let p = Promise[String]
    p.next[None]( { (name: String) =>
      promise( name + "." + input )
    })
    block.name(p)

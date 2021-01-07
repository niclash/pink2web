use "collections"

use "../system"

primitive FormHandler
  fun apply( body:String ): Map[String,String] val =>
    var result:Map[String,String] iso = recover Map[String,String] end
    let total = body.size().isize()
    var start:ISize = 0
    var finish:ISize = -1
    while finish < total do
      start = finish+1
      finish = try (body.find( "&", (start+1).isize() )?) else body.size().isize() end
      let pair:String = body.substring(start,finish)
      (let key, let value) = parse_pair( pair )
      result.insert(key,value)
    end
    consume result

  fun parse_pair( text:String ): (String val,String val) =>
    try
      let pos = text.find("=")?
      (text.substring(0,pos),text.substring(pos+1))
    else
      (text,"")
    end

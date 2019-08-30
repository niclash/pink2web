use "json"

interface ToJson 
  fun to_json() : JsonObject ref^
  
trait JsonVisitable
  be json_visit( visitor: JsonVisitor val )
  
interface JsonVisitor
  fun got( value: JsonType )

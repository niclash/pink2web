use "json"

interface ToJson 
  fun to_json() : JsonObject ref^
  
trait JsonVisitable
  be json_visit( visitor: JsonVisitor tag )
  
interface JsonVisitor
  fun tag got( value: JsonObject box )

use "json"

interface ToJson 
  fun to_json() : JsonObject ref^
  
trait JsonVisitable
  be visit( { (JsonType): None } )
  

use "json"

interface ToJson 
  fun to_json() : JsonObject ref^
  
interface JsonVisitable
  be visit( lambda:{ (JsonType) } val )
  

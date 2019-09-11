use "json"
use "../system"

interface val BlockFactory
  fun createBlock( name: String val, context:SystemContext val): Block tag  
  fun describe(): JsonObject ref^

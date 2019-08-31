use "json"

interface val BlockFactory
  fun createBlock( name: String val ): Block tag  
  fun describe(): JsonObject ref^

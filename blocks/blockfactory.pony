use "json"
use "logger"

interface val BlockFactory
  fun createBlock( name: String val, logger:Logger[String] ): Block tag  
  fun describe(): JsonObject ref^

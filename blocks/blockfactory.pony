use "json"
use "../system"

interface val BlockFactory
  fun create_block( name: String val, context:SystemContext val): Block tag  
  fun block_type_descriptor(): BlockTypeDescriptor val
  fun describe(): JsonObject ref^

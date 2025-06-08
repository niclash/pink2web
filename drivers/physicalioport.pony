
use "../system"

interface val PhysicalPortConfigNotify
  fun ports_config_updated(driver:Driver, port: PhysicalIoPortInfo, state: Presence)

interface val PhysicalPortValueNotify
  fun port_value_updated(port: PhysicalIoPortInfo, value: Linkable)


class val PhysicalIoPortInfo is (Equatable[PhysicalIoPortInfo] & Stringable)
    let id: String         // URN: urn:<driver_name>:<port_identifier>
    let port_type: String  // e.g., "boolean", "I64", "F64"
    let description: String
    let schema: String
    let required: Bool
    let addressable: Bool

    new val create(id': String,port_type': String,description': String = "",schema': String = "",required': Bool = false,addressable': Bool = false) =>
        id = id'
        port_type = port_type'
        description = description'
        schema = schema'
        required = required'
        addressable = addressable'

    fun box eq(other:PhysicalIoPortInfo): Bool val =>
      if this == other then
        return true
      end
      this.id == other.id

    fun box ne(other:PhysicalIoPortInfo): Bool val =>
      not eq(other)

    fun box string(): String iso^ =>
      recover iso "io-port[" + id + "]" end

    fun box hash(): USize val =>
      id.hash()

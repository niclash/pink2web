class val PhysicalPortInfo
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


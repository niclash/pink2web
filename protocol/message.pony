
use "jay"

primitive Message

  fun apply( protocol: String, command: String, payload: JObj ): JObj =>
    JObj + ( "protocol", protocol ) + ( "command", command ) + ( "payload", payload )
      
  fun err( protocol: String, message: String ): JObj =>
    let payload = JObj + ( "message", message )
    JObj + ( "protocol", protocol ) + ( "command", "error" ) + ( "payload", payload )

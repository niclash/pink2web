
use "jay"

primitive Message

  fun apply( protocol: String, command: String, payload': J ): JObj =>
    JObj + ( "protocol", protocol ) + ( "command", command ) + ( "payload", payload' ) + ("secret", NotSet)
      
  fun empty( protocol: String, command: String): JObj =>
    JObj + ( "protocol", protocol ) + ( "command", command )


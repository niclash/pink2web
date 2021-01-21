
use "jay"

primitive Message

  fun apply( protocol: String, command: String, payload: J ): JObj =>
    let payload' = match payload
    | let p:JObj => p + ("secret", NotSet)
    else
      payload
    end
    JObj + ( "protocol", protocol ) + ( "command", command ) + ( "payload", payload' )
      
  fun empty( protocol: String, command: String): JObj =>
    JObj + ( "protocol", protocol ) + ( "command", command )


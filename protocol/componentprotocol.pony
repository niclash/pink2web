
use "jay"
use "promises"
use "../blocktypes"
use "./component"
use "./network"
use "../system"
use "../web"

class val ComponentProtocol
  let _blocktypes: BlockTypes
  let _authorizer: Authorizer

  new val create( blocktypes: BlockTypes, authorizer: Authorizer) =>
    _blocktypes = blocktypes
    _authorizer = authorizer

  fun execute( connection: WebSocketSender, command: String, payload: JObj, secret:String ) =>
    let p = Promise[Bool val]
    p.next[None]({ (valid:Bool val) =>
      if valid then
        match command
        | "list" => ListMessage(connection, _blocktypes)
        | "getsource" => GetSourceMessage(connection, _blocktypes, payload )
        else
          ErrorMessage( connection, None, "Invalid command: " + command, true )
        end
      else
        ErrorMessage( connection, None, "Invalid secret: " + secret, true )
      end
    })
    _authorizer.isValid(secret, p)


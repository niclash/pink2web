use "collections"
use "jay"
use "promises"
use "../../web"
use "../../graphs"

primitive ListGraphsMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    let promise = Promise[List[Graph]val]
    promise.next[None]( { (list) =>
      for g in list.values() do
        g.status()
      end
    })
    graphs.list(promise)

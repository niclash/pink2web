
class val RuntimeConfiguration
  let secret: String
  let host: String
  let port: U32
  let drivers: ReadSeq[String]
  let webdir: String
  let startpage: String

  new val create(secret':String, host': String, port': U32, webdir': String, startpage': String, drivers': ReadSeq[String val] val ) =>
    secret = secret'
    host = host'
    port = port'
    drivers = drivers'
    webdir = webdir'
    startpage = startpage'

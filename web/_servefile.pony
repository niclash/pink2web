use "files"
use "jennet"
use "http_server"
use "valbytes"

primitive _ServeFile
  fun apply(ctx:Context iso, filepath:FilePath): Context iso^ =>
    try
      var bs = ByteArrays
      with file = OpenFile(filepath) as File do
        while true do
          let chunk:Array[U8] iso = file.read(2048)
          if chunk.size() == 0 then break end
          bs = bs + consume chunk
        end
      end
      ctx.respond(StatusResponse(StatusOK), bs)
    else
      ctx.respond(StatusResponse(StatusNotFound))
    end
    consume ctx


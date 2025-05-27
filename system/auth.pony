use "collections"
use "promises"
use "uuid"

actor Authorizer
  let _users: Map[String, String] = Map[String,String]
  let _context: SystemContext
  var _secrets: Array[String] = Array[String]

  new create(users': Map[String, String] val, context: SystemContext) =>
    for (user, pass) in users'.pairs() do
      _users.insert(user,pass)
    end
    _context = context

  be authorize(user:String, pass:String, cb: Promise[(String|None)] ) =>
    try
      if _users(user)? == pass then
        let secret = recover val UUID.v4().string() end
        if not _secrets.contains(secret) then
          _secrets.push(secret)
          cb(secret)
          return
        end
      end
    end
    cb(None)

  be clearAuthorization(secret:String) =>
    try
      let pos = _secrets.find(secret, 0, 0, {(a: String, b:String) => a == b })?
      _secrets.remove(pos, 1)
    end

  be isValid( secret':String, cb: Promise[Bool val] tag) =>
    let valid = _secrets.contains(secret', {(a: String, b:String) => a == b })
    if not valid then
      _context.log(Info, "Sent secret: " + secret' )
      for s in _secrets.values() do
        _context.log(Info, "Valid secret: " + s )
      end
    end
    cb(valid)

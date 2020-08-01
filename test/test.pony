actor Main
    new create(env: Env) =>
        var w = U32.max_value()
        var x = w + 1
        env.out.print("w + 1       " + x.string())  // 0

        x = w + U32(1)
        env.out.print("w + U32(1)  " + x.string())  // 0

        x = w +~ 1
        env.out.print("w +~ 1      " + x.string())  // 0

        x = w +~ U32(1)
        env.out.print("w +~ U32(1) " + x.string())  // 4294967295, but must be 0

        let y = U32.max_value() - 1
        x = y +~ 2
        env.out.print("y +~ 2      " + x.string())  // 0

        x = y +~ U32(2)
        env.out.print("y +~ 2      " + x.string())  // 0


primitive ComponentsReadyMessage

  fun apply(size: USize): String =>
    "{ \"protocol\":\"component\", \"command\": \"componentsready\", \"payload\": " + size.string() + " }"

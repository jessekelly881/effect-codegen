import * as S from "@effect/schema/Schema";
export const Alias = S.record(
  S.struct({
    command: S.string.pipe(
      S.title("command"),
      S.description(
        "A command of the current alias\nhttps://github.com/sebglazebrook/aliases#usage"
      ),
      S.examples(["ls"]),
      S.minLength(1)
    ),
    confirm: S.optional(S.boolean),
    confirmation_message: S.optional(
      S.string.pipe(
        S.title("confirmation message"),
        S.description(
          "A confirmation message of the current alias\nhttps://github.com/sebglazebrook/aliases#usage"
        ),
        S.examples(["Do you want to execute this command?"]),
        S.minLength(1)
      )
    ),
    conditional: S.optional(
      S.string.pipe(
        S.title("conditional"),
        S.description(
          "A conditional of the current alias\nhttps://github.com/sebglazebrook/aliases#usage"
        ),
        S.examples(["/bin/true"]),
        S.minLength(1)
      )
    ),
    backout_seconds: S.optional(
      S.number.pipe(
        S.title("backout seconds"),
        S.description(
          "A backout of the current alias\nhttps://github.com/sebglazebrook/aliases#usage"
        ),
        S.int()
      )
    ),
    unit_test: S.optional(
      S.string.pipe(
        S.title("conditional"),
        S.description(
          "A unit test of the current alias\nhttps://github.com/sebglazebrook/aliases#usage"
        ),
        S.examples(["[ true = true ]"]),
        S.minLength(1)
      )
    ),
    quiet: S.optional(S.boolean),
  })
    .pipe(
      S.title("alias"),
      S.description(
        "An alias of the current directory\nhttps://github.com/sebglazebrook/aliases#usage"
      )
    )
    .pipe(S.pattern(/^[^ ]+$/)),
  S.struct({
    command: S.string.pipe(
      S.title("command"),
      S.description(
        "A command of the current alias\nhttps://github.com/sebglazebrook/aliases#usage"
      ),
      S.examples(["ls"]),
      S.minLength(1)
    ),
    confirm: S.optional(S.boolean),
    confirmation_message: S.optional(
      S.string.pipe(
        S.title("confirmation message"),
        S.description(
          "A confirmation message of the current alias\nhttps://github.com/sebglazebrook/aliases#usage"
        ),
        S.examples(["Do you want to execute this command?"]),
        S.minLength(1)
      )
    ),
    conditional: S.optional(
      S.string.pipe(
        S.title("conditional"),
        S.description(
          "A conditional of the current alias\nhttps://github.com/sebglazebrook/aliases#usage"
        ),
        S.examples(["/bin/true"]),
        S.minLength(1)
      )
    ),
    backout_seconds: S.optional(
      S.number.pipe(
        S.title("backout seconds"),
        S.description(
          "A backout of the current alias\nhttps://github.com/sebglazebrook/aliases#usage"
        ),
        S.int()
      )
    ),
    unit_test: S.optional(
      S.string.pipe(
        S.title("conditional"),
        S.description(
          "A unit test of the current alias\nhttps://github.com/sebglazebrook/aliases#usage"
        ),
        S.examples(["[ true = true ]"]),
        S.minLength(1)
      )
    ),
    quiet: S.optional(S.boolean),
  }).pipe(
    S.title("alias"),
    S.description(
      "An alias of the current directory\nhttps://github.com/sebglazebrook/aliases#usage"
    )
  )
).pipe(
  S.title("alias"),
  S.description(
    "An alias of the current directory\nhttps://github.com/sebglazebrook/aliases#usage"
  )
);

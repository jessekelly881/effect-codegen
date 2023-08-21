import * as Effect from "@effect/io/Effect";
import * as Fs from "@effect/platform-node/FileSystem"
import { flow, pipe } from "@effect/data/Function";
import * as Log from "effect-log";
import * as S from "@effect/schema/Schema";
import { ParseJson } from "./utils/json";
import * as JsonSchema from "./jsonSchema";

/**
 * Flatly parses the value of an Effect.
 * @param schema 
 * @returns 
 */
const parseFlat = <I, A>(schema: S.Schema<I, A>) => Effect.flatMap(S.parse(schema))

const readFile = pipe(
  Fs.FileSystem,
  Effect.flatMap((fs) => fs.readFile(`${__dirname}/test.json`)),
  Effect.map((s) => new TextDecoder().decode(s)),

  // FIXME: Composing the schemas throws "`partial` cannot handle transformations"
  parseFlat(ParseJson.pipe(S.compose(JsonSchema.JSONSchema))),
);

const run = flow(
  Effect.provideLayer(Fs.layer),
  Effect.catchAll((s) => Effect.logError("Err")),
  Effect.provideLayer(
    Log.setPrettyLogger({ showFiberId: false, showTime: false })
  ),
  Effect.runPromise
)

run(readFile.pipe(Effect.flatMap((s) => Effect.log(s))))
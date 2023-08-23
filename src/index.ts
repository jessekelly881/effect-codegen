import * as Effect from "@effect/io/Effect";
import * as Fs from "@effect/platform-node/FileSystem"
import { flow, pipe } from "@effect/data/Function";
import * as Log from "effect-log";
import * as S from "@effect/schema/Schema";
import * as JsonSchema from "./jsonSchema";
import { ParseJson } from "./utils/Schema";
import format from "prettier-eslint";

const formatCode = (code: string) => Effect.promise(() => format({ text: code }))

const writeFileString = (path: string) => (code: string) => Fs.FileSystem.pipe(
  Effect.flatMap((fs) => fs.writeFileString(path, code))
)

const program = pipe(
  Fs.FileSystem,
  Effect.flatMap((fs) => fs.readFileString(`${__dirname}/test.json`)),
  Effect.flatMap(S.parse((ParseJson))),
  Effect.flatMap(JsonSchema.decodeSchema),
  Effect.map(JsonSchema.toFile),
  Effect.flatMap(formatCode),
  Effect.flatMap(writeFileString(`${__dirname}/../test.ts`))
);


const run = flow(
  Effect.provideLayer(Fs.layer),
  Effect.catchAll((s) => Effect.logError(s)),
  Effect.provideLayer(
    Log.setPrettyLogger({ showFiberId: false, showTime: false })
  ),
  Effect.runPromise
)

run(program)
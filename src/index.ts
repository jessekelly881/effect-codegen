import * as Effect from "@effect/io/Effect";
import * as Fs from "@effect/platform-node/FileSystem"
import { pipe } from "@effect/data/Function";


const readFile = pipe(
    Fs.FileSystem,
    Effect.flatMap((fs) => fs.readFile(`${__dirname}/test.json`)),
    Effect.map(s => new TextDecoder().decode(s)),
    Effect.flatMap(s => Effect.log(s)),
    Effect.provideLayer(Fs.layer),
    Effect.catchAll(s => Effect.logError("Err"))
)

Effect.runPromise(readFile)
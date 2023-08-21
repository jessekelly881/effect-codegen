import * as Effect from "@effect/io/Effect";
import * as Fs from "@effect/platform-node/FileSystem";
import * as Doc from "@effect/printer/Doc"
import * as Render from "@effect/printer/Render"

/**
 * Renders a Doc to a string and writes that string to a file.
 */
export const writeFileDoc = <A>(path: string, doc: Doc.Doc<A>) =>
  Fs.FileSystem.pipe(
    Effect.flatMap((fs) =>
      fs.writeFileString(path, Render.pretty(doc as any, { lineWidth: 14 }))
    )
  );
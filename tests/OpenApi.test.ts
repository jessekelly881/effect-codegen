/**
 * @since 1.0.0
 */

import { Parser, Schema, TreeFormatter } from "@effect/schema";
import { Either } from "effect";
import fs from "fs";
import path from "path";
import { describe, it } from "vitest";
import * as OpenApi from "../src/OpenApi";
import { ParseYaml } from "../src/utils/Schema";

const parseFile = ParseYaml.pipe(
	Schema.compose(OpenApi.OpenApiSchema),
	Parser.parseEither
);

const expectRight = <E, A>(e: Either.Either<E, A>) => {
	if (Either.isLeft(e)) {
		throw e;
	}
};

const dirPath = path.join(__dirname, "fixtures");
let files: [string, string][] = []; // [fileName, contents][]
fs.readdirSync(dirPath).forEach((fileName) => {
	const filePath = path.join(dirPath, fileName);
	const contents = fs.readFileSync(filePath).toString();
	files.push([fileName, contents]);
});

describe("OpenApi/decodeFromString", () => {
	it.each(files)("should decode %s", (_, contents) => {
		const result = Either.mapLeft(parseFile(contents), (err) =>
			TreeFormatter.formatErrors(err.errors)
		);

		expectRight(result);
	});
});

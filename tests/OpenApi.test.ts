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

const getAllFiles = function (dirPath, arrayOfFiles: string[] = []) {
	const files = fs.readdirSync(dirPath);

	files.forEach(function (file) {
		if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
		} else {
			arrayOfFiles.push(path.join(dirPath, "/", file));
		}
	});

	return arrayOfFiles;
};

const dirPath = path.join(__dirname, "fixtures/openapi-directory/APIs");
const filePaths = getAllFiles(dirPath);

const LIMIT = 25;
describe("OpenApi/decodeFromString", () => {
	it.each(filePaths.slice(0, LIMIT))("should decode %s", (path) => {
		const contents = fs.readFileSync(path).toString();
		const result = Either.mapLeft(parseFile(contents), (err) =>
			TreeFormatter.formatErrors(err.errors)
		);

		expectRight(result);
	});
});

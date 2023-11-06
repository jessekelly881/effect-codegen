#!/usr/bin/env tsx

import * as FileSystem from "@effect/platform-node/FileSystem";
import * as Path from "@effect/platform-node/Path";
import { runMain } from "@effect/platform-node/Runtime";
import { Parser, Schema } from "@effect/schema";
import { Console, Effect, Layer } from "effect";
import { ParseYaml } from "./src/utils/Schema";

const openApiSchema = Schema.struct({
	info: Schema.struct({
		title: Schema.string,
		description: Schema.string,
		version: Schema.string
	}),
	paths: Schema.record(
		Schema.string,
		Schema.record(
			Schema.string,
			Schema.struct({
				operationId: Schema.string
			})
		)
	).pipe(Schema.optional)
});

const decodeOpenApiSchema = ParseYaml.pipe(
	Schema.compose(openApiSchema),
	Parser.decode
);

const ctx = Layer.mergeAll(FileSystem.layer, Path.layer);

const program = Effect.gen(function* (_) {
	const fs = yield* _(FileSystem.FileSystem);
	const path = yield* _(Path.Path);

	const fileData = yield* _(
		fs.readFileString(path.join(__dirname, "test.yml"))
	);

	const obj = yield* _(decodeOpenApiSchema(fileData));

	yield* _(Console.log(obj));
});

program.pipe(Effect.orDie, Effect.provide(ctx), runMain);

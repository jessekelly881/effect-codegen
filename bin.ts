#!/usr/bin/env tsx

import { CliApp, Command, HelpDoc, Options } from "@effect/cli";
import * as Span from "@effect/cli/HelpDoc/Span";
import * as FileSystem from "@effect/platform-node/FileSystem";
import * as Path from "@effect/platform-node/Path";
import { Parser, Schema } from "@effect/schema";
import { Console, Data, Effect, Layer, pipe } from "effect";
import packageJson from "./package.json";
import { ParseYaml } from "./src/utils/Schema";

const openApiSchema = Schema.struct({
	info: Schema.struct({
		title: Schema.string,
		description: Schema.string,
		version: Schema.string
	}),
	servers: Schema.array(
		Schema.struct({
			description: Schema.string,
			url: Schema.string
		})
	),
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

const compileSchema = (inputFile: string) =>
	Effect.gen(function* (_) {
		const fs = yield* _(FileSystem.FileSystem);
		const path = yield* _(Path.Path);

		const fileData = yield* _(
			fs.readFileString(path.join(__dirname, inputFile)),
			Effect.tapError(() => Console.error(`File ${inputFile} not found`))
		);

		const obj = yield* _(decodeOpenApiSchema(fileData));

		yield* _(Console.log(obj));
	});

/**
 * Cli
 */

interface CliMain extends Data.Case {
	readonly version: boolean;
}

const CliMain = Data.case<CliMain>();

const run: Command.Command<CliMain> = pipe(
	Command.make("run", {
		options: Options.alias(Options.boolean("version"), "v")
	}),
	Command.map(({ options: version }) => CliMain({ version }))
);

const cli = CliApp.make({
	name: "@effect/schema codegen",
	version: packageJson.version,
	command: run,
	summary: Span.text("a codegen cli for @effect/schema"),
	footer: HelpDoc.p("Copyright 2023")
});

const ctx = Layer.mergeAll(FileSystem.layer, Path.layer);

pipe(
	Effect.sync(() => process.argv.slice(2)),
	Effect.flatMap((args) =>
		CliApp.run(
			cli,
			args,
			({ version }) =>
				version ? Console.log(cli.version) : compileSchema(args[0]) // args[0] is the input file
		)
	),
	Effect.provide(ctx),
	Effect.runFork
);

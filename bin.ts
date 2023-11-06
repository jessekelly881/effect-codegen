#!/usr/bin/env tsx

import { CliApp, Command, HelpDoc, Options } from "@effect/cli";
import * as Span from "@effect/cli/HelpDoc/Span";
import * as FileSystem from "@effect/platform-node/FileSystem";
import * as Path from "@effect/platform-node/Path";
import { Parser, Schema } from "@effect/schema";
import { Console, Data, Effect, Layer, pipe } from "effect";
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

const ctx = Layer.mergeAll(FileSystem.layer, Path.layer);

const program = Effect.gen(function* (_) {
	const fs = yield* _(FileSystem.FileSystem);
	const path = yield* _(Path.Path);

	const fileData = yield* _(
		fs.readFileString(path.join(__dirname, "test.yml"))
	);

	const obj = yield* _(decodeOpenApiSchema(fileData));

	yield* _(Console.log(obj));
}).pipe(Effect.orDie, Effect.provide(ctx));

/**
 * Cli
 */

export interface Git extends Data.Case {
	readonly version: boolean;
}

export const Git = Data.case<Git>();

const run: Command.Command<Git> = pipe(
	Command.make("run", {
		options: Options.alias(Options.boolean("version"), "v")
	}),
	Command.map(({ options: version }) => Git({ version }))
);

const cli = CliApp.make({
	name: "Git Version Control",
	version: "0.9.2",
	command: run,
	summary: Span.text("a client for the git dvcs protocol"),
	footer: HelpDoc.p("Copyright 2023")
});

pipe(
	Effect.sync(() => process.argv.slice(2)),
	Effect.flatMap((args) =>
		CliApp.run(cli, args, ({ version }) =>
			version ? Console.log(cli.version) : program
		)
	),
	Effect.runFork
);

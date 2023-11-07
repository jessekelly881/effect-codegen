/**
 * @since 1.0.0
 */
import { ParseYaml } from "@/utils/Schema";
import { Parser, Schema } from "@effect/schema";

export const OpenApiSchema = Schema.struct({
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

export type OpenApiSchema = Schema.Schema.To<typeof OpenApiSchema>;

export const decodeFromString = ParseYaml.pipe(
	Schema.compose(OpenApiSchema),
	Parser.decode
);

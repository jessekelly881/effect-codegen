/**
 * @since 1.0.0
 */
import { ParseYaml } from "@/utils/Schema";
import { Parser, Schema } from "@effect/schema";

/**
 * JSON Schema-ish OpenApi Schema definition
 */
const DataModel = Schema.struct({
	$ref: Schema.string,

	description: Schema.string,
	example: Schema.string,
	type: Schema.literal("string", "integer")
}).pipe(Schema.partial);

const HttpMethod = Schema.literal(
	"get",
	"put",
	"post",
	"delete",
	"options",
	"head",
	"patch",
	"trace"
);

export const OpenApiSchema = Schema.struct({
	info: Schema.struct({
		title: Schema.string,
		description: Schema.string,
		version: Schema.string
	}).pipe(Schema.partial),
	servers: Schema.array(
		Schema.struct({
			description: Schema.string.pipe(Schema.optional),
			url: Schema.string
		})
	).pipe(Schema.optional),
	paths: Schema.record(
		Schema.string,
		Schema.record(
			HttpMethod,
			Schema.struct({
				operationId: Schema.string,
				description: Schema.string
			}).pipe(Schema.partial)
		).pipe(Schema.partial)
	).pipe(Schema.optional)
});

export type OpenApiSchema = Schema.Schema.To<typeof OpenApiSchema>;

export const decodeFromString = ParseYaml.pipe(
	Schema.compose(OpenApiSchema),
	Parser.decode
);

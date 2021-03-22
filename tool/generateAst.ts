function defineAst(outputDir: string, baseName: string, types: string[]) {
  const path = `${outputDir}/${baseName}.ts`;

  const lines = [
    "// Auto-generated. DO NOT MODIFY.",
    'import Token from "./Token.ts"',
    'import { Expr } from "./Expr.ts"',
    "",
    `export abstract class ${baseName} {`,
    `  abstract accept<R>(visitor: ${baseName}Visitor<R>): R`,
    "}",
    "",
  ];

  defineVisitor(lines, baseName, types);

  for (const type of types) {
    const [className, fields] = type.split("|").map((p) => p.trim());
    defineType(lines, baseName, className, fields);
  }

  Deno.writeTextFileSync(path, lines.join("\n"));
}

function defineVisitor(lines: string[], baseName: string, types: string[]) {
  lines.push(`export interface ${baseName}Visitor<R> {`);
  for (const type of types) {
    const typeName = type.split("|")[0].trim();
    lines.push(
      `  visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}${baseName}): R`
    );
  }
  lines.push("}");
  lines.push("");
}

function defineType(
  lines: string[],
  baseName: string,
  className: string,
  fieldList: string
) {
  lines.push(`export class ${className}${baseName} extends ${baseName} {`);
  lines.push(`  constructor(`);
  const fields = fieldList.split(", ");
  for (const field of fields) {
    lines.push(`    public ${field},`);
  }
  lines.push("  ) {");
  lines.push("    super()");
  lines.push("  }");
  lines.push("");
  lines.push(`  accept<R>(visitor: ${baseName}Visitor<R>): R {`);
  lines.push(`    return visitor.visit${className}${baseName}(this)`);
  lines.push("  }");
  lines.push("}");
  lines.push("");
}

if (Deno.args.length !== 1) {
  console.log("Usage: generate_ast <output directory>");
  Deno.exit(64);
}

const outputDir = Deno.args[0];

defineAst(outputDir, "Expr", [
  'Assign   | name: Token, value: Expr',
  "Binary   | left: Expr, operator: Token, right: Expr",
  "Grouping | expression: Expr",
  "Literal  | value: any",
  "Unary    | operator: Token, right: Expr",
  "Variable | name: Token",
]);

defineAst(outputDir, "Stmt", [
  "Expression | expression: Expr",
  "Print      | expression: Expr",
  "Var        | name: Token, initializer?: Expr",
]);

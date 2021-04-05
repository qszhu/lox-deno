[lox](https://craftinginterpreters.com/a-tree-walk-interpreter.html) interpreter in Deno

* generate AST files

```bash
$ deno run --allow-write tool/generateAst.ts ./lox
```

* build binary

```bash
$ deno compile --unstable --allow-read --lite --output dlox lox/Lox.ts
```
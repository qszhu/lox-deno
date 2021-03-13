import {
  BinaryExpr,
  Expr,
  ExprVisitor,
  GroupingExpr,
  LiteralExpr,
  UnaryExpr,
} from "./Expr.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

class AstPrinter implements ExprVisitor<string> {
  print(expr: Expr) {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: BinaryExpr): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: GroupingExpr): string {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: LiteralExpr): string {
    if (expr.value === null) return "nil";
    return expr.value.toString();
  }

  visitUnaryExpr(expr: UnaryExpr): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(name: string, ...exprs: Expr[]) {
    const res: string[] = [];
    res.push("(", name);
    for (const expr of exprs) {
      res.push(" ", expr.accept(this));
    }
    res.push(")");
    return res.join("");
  }
}

if (import.meta.main) {
  const expression = new BinaryExpr(
    new UnaryExpr(
      new Token(TokenType.MINUS, "-", null, 1),
      new LiteralExpr(123)
    ),
    new Token(TokenType.STAR, "*", null, 1),
    new GroupingExpr(new LiteralExpr(45.67))
  );
  console.log(new AstPrinter().print(expression));
}

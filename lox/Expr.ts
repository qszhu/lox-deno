// Auto-generated. DO NOT MODIFY.
import Token from "./Token.ts"

export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>): R
}

export interface ExprVisitor<R> {
  visitBinaryExpr(expr: BinaryExpr): R
  visitGroupingExpr(expr: GroupingExpr): R
  visitLiteralExpr(expr: LiteralExpr): R
  visitUnaryExpr(expr: UnaryExpr): R
}

export class BinaryExpr extends Expr {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr,
  ) {
    super()
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBinaryExpr(this)
  }
}

export class GroupingExpr extends Expr {
  constructor(
    public expression: Expr,
  ) {
    super()
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitGroupingExpr(this)
  }
}

export class LiteralExpr extends Expr {
  constructor(
    public value: any,
  ) {
    super()
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLiteralExpr(this)
  }
}

export class UnaryExpr extends Expr {
  constructor(
    public operator: Token,
    public right: Expr,
  ) {
    super()
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitUnaryExpr(this)
  }
}

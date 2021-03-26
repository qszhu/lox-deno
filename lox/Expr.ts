// Auto-generated. DO NOT MODIFY.
import Token from "./Token.ts"

export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>): R
}

export interface ExprVisitor<R> {
  visitAssignExpr(expr: AssignExpr): R
  visitBinaryExpr(expr: BinaryExpr): R
  visitCallExpr(expr: CallExpr): R
  visitGroupingExpr(expr: GroupingExpr): R
  visitLiteralExpr(expr: LiteralExpr): R
  visitLogicalExpr(expr: LogicalExpr): R
  visitUnaryExpr(expr: UnaryExpr): R
  visitVariableExpr(expr: VariableExpr): R
}

export class AssignExpr extends Expr {
  constructor(
    public name: Token,
    public value: Expr,
  ) {
    super()
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitAssignExpr(this)
  }
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

export class CallExpr extends Expr {
  constructor(
    public callee: Expr,
    public paren: Token,
    public args: Expr[],
  ) {
    super()
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitCallExpr(this)
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

export class LogicalExpr extends Expr {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr,
  ) {
    super()
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLogicalExpr(this)
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

export class VariableExpr extends Expr {
  constructor(
    public name: Token,
  ) {
    super()
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitVariableExpr(this)
  }
}

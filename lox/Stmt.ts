// Auto-generated. DO NOT MODIFY.
import Token from "./Token.ts"
import { Expr } from "./Expr.ts"

export abstract class Stmt {
  abstract accept<R>(visitor: StmtVisitor<R>): R
}

export interface StmtVisitor<R> {
  visitExpressionStmt(stmt: ExpressionStmt): R
  visitPrintStmt(stmt: PrintStmt): R
  visitVarStmt(stmt: VarStmt): R
}

export class ExpressionStmt extends Stmt {
  constructor(
    public expression: Expr,
  ) {
    super()
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitExpressionStmt(this)
  }
}

export class PrintStmt extends Stmt {
  constructor(
    public expression: Expr,
  ) {
    super()
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitPrintStmt(this)
  }
}

export class VarStmt extends Stmt {
  constructor(
    public name: Token,
    public initializer?: Expr,
  ) {
    super()
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitVarStmt(this)
  }
}

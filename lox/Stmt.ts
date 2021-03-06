// Auto-generated. DO NOT MODIFY.
import Token from "./Token.ts"
import { Expr, VariableExpr } from "./Expr.ts"

export abstract class Stmt {
  abstract accept<R>(visitor: StmtVisitor<R>): R
}

export interface StmtVisitor<R> {
  visitBlockStmt(stmt: BlockStmt): R
  visitClassStmt(stmt: ClassStmt): R
  visitExpressionStmt(stmt: ExpressionStmt): R
  visitFunctionStmt(stmt: FunctionStmt): R
  visitIfStmt(stmt: IfStmt): R
  visitPrintStmt(stmt: PrintStmt): R
  visitReturnStmt(stmt: ReturnStmt): R
  visitVarStmt(stmt: VarStmt): R
  visitWhileStmt(stmt: WhileStmt): R
}

export class BlockStmt extends Stmt {
  constructor(
    public statements: Stmt[],
  ) {
    super()
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitBlockStmt(this)
  }
}

export class ClassStmt extends Stmt {
  constructor(
    public name: Token,
    public methods: FunctionStmt[],
    public superclass?: VariableExpr,
  ) {
    super()
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitClassStmt(this)
  }
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

export class FunctionStmt extends Stmt {
  constructor(
    public name: Token,
    public params: Token[],
    public body: Stmt[],
  ) {
    super()
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitFunctionStmt(this)
  }
}

export class IfStmt extends Stmt {
  constructor(
    public condition: Expr,
    public thenBranch: Stmt,
    public elseBranch?: Stmt,
  ) {
    super()
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitIfStmt(this)
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

export class ReturnStmt extends Stmt {
  constructor(
    public keyword: Token,
    public value?: Expr,
  ) {
    super()
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitReturnStmt(this)
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

export class WhileStmt extends Stmt {
  constructor(
    public condition: Expr,
    public body: Stmt,
  ) {
    super()
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitWhileStmt(this)
  }
}

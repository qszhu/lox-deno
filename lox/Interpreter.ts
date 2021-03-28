import Environment from "./Environment.ts";
import {
  AssignExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  ExprVisitor,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  UnaryExpr,
  VariableExpr,
} from "./Expr.ts";
import Lox from "./Lox.ts";
import LoxCallable from "./LoxCallable.ts";
import LoxFunction from "./LoxFunction.ts";
import Return from "./Return.ts";
import RuntimeError from "./RuntimeError.ts";
import {
  BlockStmt,
  ExpressionStmt,
  FunctionStmt,
  IfStmt,
  PrintStmt,
  ReturnStmt,
  StmtVisitor,
  Stmt,
  VarStmt,
  WhileStmt,
} from "./Stmt.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

function checkUnaryNumberOperand(operator: Token, operand: any) {
  if (typeof operand === "number") return;
  throw new RuntimeError(operator, "Operand must be a number.");
}

function checkBinaryNumberOperand(operator: Token, left: any, right: any) {
  if (typeof left === "number" && typeof right === "number") return;
  throw new RuntimeError(operator, "Operand must be a number.");
}

function stringify(o: any) {
  if (o === null) return "nil";
  return `${o}`;
}

function isCallable(callee: any) {
  return "call" in callee && "arity" in callee;
}

class NativeClock implements LoxCallable {
  get arity(): number {
    return 0;
  }

  call(interpreter: Interpreter, args: any[]) {
    return new Date().getTime() / 1000;
  }

  toString(): string {
    return "<native fn>";
  }
}

export default class Interpreter
  implements ExprVisitor<any>, StmtVisitor<void> {
  globals: Environment = new Environment();
  private _environment = this.globals;

  constructor() {
    this.globals.define("clock", new NativeClock());
  }

  interpret(statements: Stmt[]) {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      Lox.runtimeError(error);
    }
  }

  private evaluate(expr: Expr): any {
    return expr.accept(this);
  }

  visitAssignExpr(expr: AssignExpr) {
    const value = this.evaluate(expr.value);
    this._environment.assign(expr.name, value);
    return value;
  }

  visitBinaryExpr(expr: BinaryExpr) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.GREATER:
        checkBinaryNumberOperand(expr.operator, left, right);
        return left > right;
      case TokenType.GREATER_EQUAL:
        checkBinaryNumberOperand(expr.operator, left, right);
        return left >= right;
      case TokenType.LESS:
        checkBinaryNumberOperand(expr.operator, left, right);
        return left < right;
      case TokenType.LESS_EQUAL:
        checkBinaryNumberOperand(expr.operator, left, right);
        return left <= right;
      case TokenType.BANG_EQUAL:
        return left !== right;
      case TokenType.EQUAL_EQUAL:
        return left === right;
      case TokenType.MINUS:
        checkBinaryNumberOperand(expr.operator, left, right);
        return left - right;
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return `${left}${right}`;
        }
        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings."
        );
      case TokenType.SLASH:
        checkBinaryNumberOperand(expr.operator, left, right);
        return left / right;
      case TokenType.STAR:
        checkBinaryNumberOperand(expr.operator, left, right);
        return left * right;
    }

    return null;
  }

  visitCallExpr(expr: CallExpr) {
    const callee = this.evaluate(expr.callee);

    const args: any[] = [];
    for (const arg of expr.args) {
      args.push(this.evaluate(arg));
    }

    if (!isCallable(callee)) {
      throw new RuntimeError(
        expr.paren,
        "Can only call functions and classes."
      );
    }

    const func = callee as LoxCallable;
    if (args.length !== func.arity) {
      throw new RuntimeError(
        expr.paren,
        `Expected ${func.arity} arguments but got ${args.length}.`
      );
    }
    return func.call(this, args);
  }

  visitGroupingExpr(expr: GroupingExpr) {
    return this.evaluate(expr.expression);
  }

  visitLiteralExpr(expr: LiteralExpr) {
    return expr.value;
  }

  visitLogicalExpr(expr: LogicalExpr) {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (Boolean(left)) return left;
    } else {
      if (!Boolean(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitUnaryExpr(expr: UnaryExpr) {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        checkUnaryNumberOperand(expr.operator, right);
        return -right;
      case TokenType.BANG:
        return !Boolean(right);
    }

    return null;
  }

  visitVariableExpr(expr: VariableExpr) {
    return this._environment.get(expr.name);
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  executeBlock(statements: Stmt[], environment: Environment) {
    const previous = this._environment;
    try {
      this._environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this._environment = previous;
    }
  }

  visitBlockStmt(stmt: BlockStmt): void {
    this.executeBlock(stmt.statements, new Environment(this._environment));
  }

  visitExpressionStmt(stmt: ExpressionStmt): void {
    this.evaluate(stmt.expression);
  }

  visitFunctionStmt(stmt: FunctionStmt): void {
    const func = new LoxFunction(stmt, this._environment);
    this._environment.define(stmt.name.lexeme, func);
  }

  visitIfStmt(stmt: IfStmt): void {
    if (Boolean(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      this.execute(stmt.elseBranch);
    }
  }

  visitPrintStmt(stmt: PrintStmt): void {
    const value = this.evaluate(stmt.expression);
    console.log(stringify(value));
  }

  visitReturnStmt(stmt: ReturnStmt): void {
    let value = null;
    if (stmt.value) value = this.evaluate(stmt.value);

    throw new Return(value);
  }

  visitVarStmt(stmt: VarStmt): void {
    let value = null;
    if (stmt.initializer) {
      value = this.evaluate(stmt.initializer);
    }

    this._environment.define(stmt.name.lexeme, value);
  }

  visitWhileStmt(stmt: WhileStmt): void {
    while (Boolean(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }
}

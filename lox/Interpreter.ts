import Environment from "./Environment.ts";
import {
  AssignExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  ExprVisitor,
  GetExpr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  SetExpr,
  ThisExpr,
  UnaryExpr,
  VariableExpr,
} from "./Expr.ts";
import Lox from "./Lox.ts";
import LoxCallable from "./LoxCallable.ts";
import LoxClass from "./LoxClass.ts";
import LoxFunction from "./LoxFunction.ts";
import LoxInstance from "./LoxInstance.ts";
import Return from "./Return.ts";
import RuntimeError from "./RuntimeError.ts";
import {
  BlockStmt,
  ClassStmt,
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
  private _locals = new Map<Expr, number>();

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

    const distance = this._locals.get(expr);
    if (distance !== void 0)
      this._environment.assignAt(distance, expr.name, value);
    else this.globals.assign(expr.name, value);

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

  visitGetExpr(expr: GetExpr) {
    const obj = this.evaluate(expr.obj);
    if (obj instanceof LoxInstance) {
      return obj.get(expr.name);
    }

    throw new RuntimeError(expr.name, "Only instances have properties.");
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

  visitSetExpr(expr: SetExpr): any {
    const obj = this.evaluate(expr.obj);

    if (!(obj instanceof LoxInstance)) {
      throw new RuntimeError(expr.name, "Only instances have fields.");
    }

    const value = this.evaluate(expr.value);
    obj.set(expr.name, value);
    return value;
  }

  visitThisExpr(expr: ThisExpr): any {
    return this.lookupVariable(expr.keyword, expr);
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
    return this.lookupVariable(expr.name, expr);
  }

  private lookupVariable(name: Token, expr: Expr) {
    const distance = this._locals.get(expr);
    if (distance !== void 0) {
      return this._environment.getAt(distance, name.lexeme);
    }
    return this.globals.get(name);
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  resolve(expr: Expr, depth: number) {
    this._locals.set(expr, depth);
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

  visitClassStmt(stmt: ClassStmt): void {
    let superclass;
    if (stmt.superclass) {
      superclass = this.evaluate(stmt.superclass);
      if (!(superclass instanceof LoxClass)) {
        throw new RuntimeError(
          stmt.superclass.name,
          "Superclass must be a class."
        );
      }
    }

    this._environment.define(stmt.name.lexeme, null);

    const methods = new Map<string, LoxFunction>();
    for (const method of stmt.methods) {
      const func = new LoxFunction(
        method,
        this._environment,
        method.name.lexeme === "init"
      );
      methods.set(method.name.lexeme, func);
    }

    const klass = new LoxClass(stmt.name.lexeme, methods, superclass);
    this._environment.assign(stmt.name, klass);
  }

  visitExpressionStmt(stmt: ExpressionStmt): void {
    this.evaluate(stmt.expression);
  }

  visitFunctionStmt(stmt: FunctionStmt): void {
    const func = new LoxFunction(stmt, this._environment, false);
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

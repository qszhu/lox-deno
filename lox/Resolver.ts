import ErrorReporter from "./ErrorReporter.ts";
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
  SuperExpr,
  ThisExpr,
  UnaryExpr,
  VariableExpr,
} from "./Expr.ts";
import Interpreter from "./Interpreter.ts";
import Stack from "./Stack.ts";
import {
  BlockStmt,
  ClassStmt,
  ExpressionStmt,
  FunctionStmt,
  IfStmt,
  PrintStmt,
  ReturnStmt,
  Stmt,
  StmtVisitor,
  VarStmt,
  WhileStmt,
} from "./Stmt.ts";
import Token from "./Token.ts";

enum FunctionType {
  NONE,
  FUNCTION,
  INITIALIZER,
  METHOD,
}

enum ClassType {
  NONE,
  CLASS,
  SUBCLASS,
}

export default class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private _scopes = new Stack<Map<string, boolean>>();
  private _currentFunction = FunctionType.NONE;
  private _currentClass = ClassType.NONE;

  constructor(private _interpreter: Interpreter) {}

  resolveStatements(statements: Stmt[]) {
    for (const statement of statements) {
      this.resolveStatement(statement);
    }
  }

  private resolveStatement(stmt: Stmt) {
    stmt.accept(this);
  }

  private resolveExpr(expr: Expr) {
    expr.accept(this);
  }

  private resolveFunction(func: FunctionStmt, type: FunctionType) {
    const enclosingFunction = this._currentFunction;
    this._currentFunction = type;

    this.beginScope();
    for (const param of func.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolveStatements(func.body);
    this.endScope();

    this._currentFunction = enclosingFunction;
  }

  private beginScope() {
    this._scopes.push(new Map());
  }

  private endScope() {
    this._scopes.pop();
  }

  private declare(name: Token) {
    if (this._scopes.isEmpty) return;

    const scope = this._scopes.peek();
    if (scope.has(name.lexeme)) {
      ErrorReporter.parseError(
        name,
        "Already variable with this name in this scope."
      );
    }

    scope.set(name.lexeme, false);
  }

  private define(name: Token) {
    if (this._scopes.isEmpty) return;
    this._scopes.peek().set(name.lexeme, true);
  }

  private resolveLocal(expr: Expr, name: Token) {
    for (let i = this._scopes.size - 1; i >= 0; i--) {
      if (this._scopes.get(i).has(name.lexeme)) {
        this._interpreter.resolve(expr, this._scopes.size - 1 - i);
        return;
      }
    }
  }

  visitAssignExpr(expr: AssignExpr): void {
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitBinaryExpr(expr: BinaryExpr): void {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitCallExpr(expr: CallExpr): void {
    this.resolveExpr(expr.callee);
    for (const arg of expr.args) {
      this.resolveExpr(arg);
    }
  }

  visitGetExpr(expr: GetExpr): void {
    this.resolveExpr(expr.obj);
  }

  visitGroupingExpr(expr: GroupingExpr): void {
    this.resolveExpr(expr.expression);
  }

  visitLiteralExpr(expr: LiteralExpr): void {}

  visitLogicalExpr(expr: LogicalExpr): void {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitSetExpr(expr: SetExpr): void {
    this.resolveExpr(expr.value);
    this.resolveExpr(expr.obj);
  }

  visitSuperExpr(expr: SuperExpr): void {
    if (this._currentClass === ClassType.NONE) {
      ErrorReporter.parseError(
        expr.keyword,
        "Can't use 'super' outside of a class."
      );
    } else if (this._currentClass !== ClassType.SUBCLASS) {
      ErrorReporter.parseError(
        expr.keyword,
        "Can't use 'super' in a class with no superclass."
      );
    }

    this.resolveLocal(expr, expr.keyword);
  }

  visitThisExpr(expr: ThisExpr): void {
    if (this._currentClass === ClassType.NONE) {
      ErrorReporter.parseError(
        expr.keyword,
        "Can't use 'this' outsize of a class."
      );
      return;
    }
    this.resolveLocal(expr, expr.keyword);
  }

  visitUnaryExpr(expr: UnaryExpr): void {
    this.resolveExpr(expr.right);
  }

  visitVariableExpr(expr: VariableExpr): void {
    if (
      !this._scopes.isEmpty &&
      this._scopes.peek().get(expr.name.lexeme) === false
    ) {
      ErrorReporter.parseError(
        expr.name,
        "Can't read local variable in its own initializer."
      );
    }

    this.resolveLocal(expr, expr.name);
  }

  visitBlockStmt(stmt: BlockStmt): void {
    this.beginScope();
    this.resolveStatements(stmt.statements);
    this.endScope();
  }

  visitClassStmt(stmt: ClassStmt): void {
    const enclosingClass = this._currentClass;
    this._currentClass = ClassType.CLASS;

    this.declare(stmt.name);
    this.define(stmt.name);

    if (stmt.superclass && stmt.name.lexeme === stmt.superclass.name.lexeme) {
      ErrorReporter.parseError(
        stmt.superclass.name,
        "A class can't inherit from itself."
      );
    }

    if (stmt.superclass) {
      this._currentClass = ClassType.SUBCLASS;
      this.resolveExpr(stmt.superclass);
    }

    if (stmt.superclass) {
      this.beginScope();
      this._scopes.peek().set("super", true);
    }

    this.beginScope();
    this._scopes.peek().set("this", true);

    for (const method of stmt.methods) {
      let declaration = FunctionType.METHOD;
      if (method.name.lexeme === "init") {
        declaration = FunctionType.INITIALIZER;
      }
      this.resolveFunction(method, declaration);
    }

    this.endScope();

    if (stmt.superclass) this.endScope();

    this._currentClass = enclosingClass;
  }

  visitExpressionStmt(stmt: ExpressionStmt): void {
    this.resolveExpr(stmt.expression);
  }

  visitFunctionStmt(stmt: FunctionStmt): void {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  visitIfStmt(stmt: IfStmt): void {
    this.resolveExpr(stmt.condition);
    this.resolveStatement(stmt.thenBranch);
    if (stmt.elseBranch) this.resolveStatement(stmt.elseBranch);
  }

  visitPrintStmt(stmt: PrintStmt): void {
    this.resolveExpr(stmt.expression);
  }

  visitReturnStmt(stmt: ReturnStmt): void {
    if (this._currentFunction === FunctionType.NONE) {
      ErrorReporter.parseError(
        stmt.keyword,
        "Can't return from top-level code."
      );
    }

    if (stmt.value !== void 0) {
      if (this._currentFunction === FunctionType.INITIALIZER) {
        ErrorReporter.parseError(
          stmt.keyword,
          "Can't return a value from an initializer."
        );
      }
      this.resolveExpr(stmt.value);
    }
  }

  visitVarStmt(stmt: VarStmt): void {
    this.declare(stmt.name);
    if (stmt.initializer) {
      this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
  }

  visitWhileStmt(stmt: WhileStmt): void {
    this.resolveExpr(stmt.condition);
    this.resolveStatement(stmt.body);
  }
}

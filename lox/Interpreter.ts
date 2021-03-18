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
import RuntimeError from "./RuntimeError.ts";
import Lox from "./Lox.ts";

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

export default class Interpreter implements ExprVisitor<any> {
  interpret(expression: Expr) {
    try {
      const value = this.evaluate(expression);
      console.log(stringify(value));
    } catch (error) {
      Lox.runtimeError(error);
    }
  }

  private evaluate(expr: Expr): any {
    return expr.accept(this);
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

  visitGroupingExpr(expr: GroupingExpr) {
    return this.evaluate(expr.expression);
  }

  visitLiteralExpr(expr: LiteralExpr) {
    return expr.value;
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
}

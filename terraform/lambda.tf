# Archive du code Lambda pour chaque fonction
data "archive_file" "get_todos" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/get-todos"
  output_path = "${path.module}/../lambda/get-todos.zip"
}

data "archive_file" "create_todo" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/create-todo"
  output_path = "${path.module}/../lambda/create-todo.zip"
}

data "archive_file" "update_todo" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/update-todo"
  output_path = "${path.module}/../lambda/update-todo.zip"
}

data "archive_file" "delete_todo" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/delete-todo"
  output_path = "${path.module}/../lambda/delete-todo.zip"
}

# Lambda Function - GET Todos
resource "aws_lambda_function" "get_todos" {
  filename         = data.archive_file.get_todos.output_path
  function_name    = "${local.project_name}-get-todos-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.get_todos.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.todos.name
    }
  }

  tags = merge(local.tags, {
    Name = "${local.project_name}-get-todos"
  })
}

# Lambda Function - CREATE Todo
resource "aws_lambda_function" "create_todo" {
  filename         = data.archive_file.create_todo.output_path
  function_name    = "${local.project_name}-create-todo-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.create_todo.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.todos.name
    }
  }

  tags = merge(local.tags, {
    Name = "${local.project_name}-create-todo"
  })
}

# Lambda Function - UPDATE Todo
resource "aws_lambda_function" "update_todo" {
  filename         = data.archive_file.update_todo.output_path
  function_name    = "${local.project_name}-update-todo-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.update_todo.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.todos.name
    }
  }

  tags = merge(local.tags, {
    Name = "${local.project_name}-update-todo"
  })
}

# Lambda Function - DELETE Todo
resource "aws_lambda_function" "delete_todo" {
  filename         = data.archive_file.delete_todo.output_path
  function_name    = "${local.project_name}-delete-todo-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.delete_todo.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.todos.name
    }
  }

  tags = merge(local.tags, {
    Name = "${local.project_name}-delete-todo"
  })
}

# CloudWatch Log Groups pour chaque Lambda (pour conserver les logs)
resource "aws_cloudwatch_log_group" "get_todos" {
  name              = "/aws/lambda/${aws_lambda_function.get_todos.function_name}"
  retention_in_days = 7  # Garder les logs 7 jours
}

resource "aws_cloudwatch_log_group" "create_todo" {
  name              = "/aws/lambda/${aws_lambda_function.create_todo.function_name}"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "update_todo" {
  name              = "/aws/lambda/${aws_lambda_function.update_todo.function_name}"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "delete_todo" {
  name              = "/aws/lambda/${aws_lambda_function.delete_todo.function_name}"
  retention_in_days = 7
}

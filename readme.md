# 📝 Todo List - AWS Serverless with Terraform

Modern todo list application deployed on AWS with 100% serverless architecture.

## 🏗️ Architecture

```
Frontend (S3 + CloudFront)
    ↓
API Gateway
    ↓
Lambda Functions (Node.js)
    ↓
DynamoDB
```

## 🛠️ Technologies Used

- **Terraform**: Infrastructure as Code
- **AWS Lambda**: Serverless functions
- **API Gateway**: REST API
- **DynamoDB**: NoSQL database
- **S3**: Static file storage
- **CloudFront**: CDN for global distribution

## 📋 Prerequisites

1. **Terraform** installed (version >= 1.0)
   ```bash
   # Check installation
   terraform --version
   ```

2. **AWS CLI** configured with your credentials
   ```bash
   # Install AWS CLI
   # https://aws.amazon.com/cli/

   # Configure credentials
   aws configure
   ```

3. **AWS Account** with necessary permissions

## 🚀 Deployment

### Step 1: Clone/Prepare the Project

```bash
cd todo-app/terraform
```

### Step 2: Initialize Terraform

```bash
terraform init
```

This command downloads the necessary AWS providers.

### Step 3: Plan the Deployment

```bash
terraform plan
```

Terraform displays what will be created. Check for any errors.

### Step 4: Deploy the Infrastructure

```bash
terraform apply
```

Type `yes` to confirm. Deployment takes approximately 5-10 minutes.

### Step 5: Retrieve the API URL

After deployment, Terraform displays the outputs:

```bash
terraform output api_endpoint
```

You'll see something like:
```
https://abc123xyz.execute-api.eu-west-1.amazonaws.com/dev
```

### Step 6: Configure the Frontend

1. Copy the API URL from the output
2. Open `frontend/app.js`
3. Replace the line:
   ```javascript
   const API_BASE_URL = 'https://YOUR_API_ID...';
   ```
   With your actual URL

### Step 7: Re-deploy with the Correct URL

```bash
terraform apply
```

The frontend will be uploaded to S3 with the correct configuration.

### Step 8: Access the Application

Retrieve the CloudFront URL:

```bash
terraform output cloudfront_domain
```

Open this URL in your browser!

## 📊 Available Outputs

```bash
# API Gateway URL
terraform output api_endpoint

# DynamoDB table name
terraform output dynamodb_table_name

# S3 bucket name
terraform output s3_bucket_name

# CloudFront URL
terraform output cloudfront_domain
```

## 🧪 Test the API Manually

### GET all todos
```bash
curl https://YOUR_API_URL/dev/todos
```

### POST create a todo
```bash
curl -X POST https://YOUR_API_URL/dev/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "My first todo"}'
```

### PUT update a todo
```bash
curl -X PUT https://YOUR_API_URL/dev/todos/TODO_ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### DELETE remove a todo
```bash
curl -X DELETE https://YOUR_API_URL/dev/todos/TODO_ID
```

## 🗑️ Destroy the Infrastructure

⚠️ **Warning**: This command deletes EVERYTHING (including data).

```bash
cd terraform
terraform destroy
```

Type `yes` to confirm.

## 💰 Costs

With **AWS Free Tier**, this application is **free** for 12 months:

- **Lambda**: 1M requests/month free
- **DynamoDB**: 25 GB storage + 25 WCU/RCU free
- **API Gateway**: 1M requests/month free
- **S3**: 5 GB storage free
- **CloudFront**: 50 GB transfer free

Beyond the free tier, costs are very low (a few cents per day).

## 🐛 Troubleshooting

### Error: "bucket already exists"

S3 bucket names are globally unique. The random suffix should prevent this, but if it happens:

1. Change `random_string.bucket_suffix.length` in `s3-cloudfront.tf`
2. Re-run `terraform apply`

### CORS Error in Browser

Verify that CORS headers are properly configured in Lambda and API Gateway.

### Lambda Timeout

If a Lambda function times out (> 10s), increase the `timeout` in `lambda.tf`.

### CloudWatch Logs

Check logs in the AWS console:
- CloudWatch > Log Groups > `/aws/lambda/todo-app-*`

## 📚 Resources

- [Terraform AWS Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)

## 🎓 Next Steps

To go further:

1. **Authentication**: Add Cognito to manage users
2. **CI/CD**: Automate deployment with GitHub Actions
3. **Monitoring**: Add CloudWatch alarms
4. **Testing**: Write unit tests for Lambda functions
5. **Multi-environments**: Dev, staging, prod with Terraform workspaces
6. **Custom domain**: Use Route53 for a custom domain name
7. **Optimization**: Add caching with ElastiCache

## 📝 License

Educational project - Free to use
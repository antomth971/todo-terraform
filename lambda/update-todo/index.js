const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    // Récupérer l'ID depuis le path
    const todoId = event.pathParameters?.id;
    
    if (!todoId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Todo ID is required'
        })
      };
    }
    
    // Parser le body
    const body = JSON.parse(event.body || '{}');
    
    // Vérifier que le todo existe
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: todoId }
    });
    
    const existingItem = await docClient.send(getCommand);
    
    if (!existingItem.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Todo not found'
        })
      };
    }
    
    // Construire l'expression de mise à jour
    let updateExpression = 'SET';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    
    if (body.title !== undefined) {
      updateExpression += ' #title = :title,';
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = body.title;
    }
    
    if (body.completed !== undefined) {
      updateExpression += ' completed = :completed,';
      expressionAttributeValues[':completed'] = body.completed;
    }
    
    // Retirer la virgule finale
    updateExpression = updateExpression.slice(0, -1);
    
    // Mettre à jour l'item
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: todoId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ReturnValues: 'ALL_NEW'  // Retourne l'item après mise à jour
    });
    
    const result = await docClient.send(updateCommand);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'PUT,OPTIONS'
      },
      body: JSON.stringify({
        message: 'Todo updated successfully',
        todo: result.Attributes
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Error updating todo',
        error: error.message
      })
    };
  }
};
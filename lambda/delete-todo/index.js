const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

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
    
    // Supprimer l'item
    const deleteCommand = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id: todoId }
    });
    
    await docClient.send(deleteCommand);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
      },
      body: JSON.stringify({
        message: 'Todo deleted successfully',
        id: todoId
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
        message: 'Error deleting todo',
        error: error.message
      })
    };
  }
};
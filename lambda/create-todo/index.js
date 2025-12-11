const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    // Parser le body de la requête
    const body = JSON.parse(event.body || '{}');
    
    // Validation
    if (!body.title || body.title.trim() === '') {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Title is required'
        })
      };
    }
    
    // Créer le nouvel item
    const todo = {
      id: randomUUID(),
      userId: 'anonymous',  // Pour l'instant, pas d'authentification
      title: body.title.trim(),
      completed: false,
      createdAt: Date.now()
    };
    
    // Insérer dans DynamoDB
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: todo
    });
    
    await docClient.send(command);
    
    return {
      statusCode: 201,  // 201 = Created
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: JSON.stringify({
        message: 'Todo created successfully',
        todo: todo
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
        message: 'Error creating todo',
        error: error.message
      })
    };
  }
};
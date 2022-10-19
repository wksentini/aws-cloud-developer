import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')
const docClient: DocumentClient = createDynamoDBClient()
const todosTable = process.env.TODOS_TABLE
const todoIndex = process.env.TODOS_CREATED_AT_INDEX
// TODO: Implement the dataLayer logic
export async function createTodo(todo: TodoItem): Promise<TodoItem> {
  await docClient
    .put({
      TableName: todosTable,
      Item: todo
    })
    .promise()

  return todo
}
export async function getAllTodosByUserId(userId: string): Promise<TodoItem[]> {
  const result = await docClient
    .query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()
  return result.Items as TodoItem[]
}
export async function getTodoById(todoId: string): Promise<TodoItem> {
  const result = await docClient
    .query({
      TableName: todosTable,
      IndexName: todoIndex,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      }
    })
    .promise()

  if (result.Items.length !== 0) {
    return result.Items[0] as TodoItem
  }

  return null
}
export async function getTodoByUserId(
  userId: string,
  todoId: string
): Promise<TodoItem[]> {
  const result = await docClient
    .query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId
      }
    })
    .promise()

  return result.Items as TodoItem[]
}

export async function updateTodoAttachment(todo: TodoItem): Promise<TodoItem> {
  const result = await docClient
    .update({
      TableName: todosTable,
      Key: {
        userId: todo.userId,
        todoId: todo.todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': todo.attachmentUrl
      }
    })
    .promise()
  return result.Attributes as TodoItem
}
export async function updateTodo(updatedTodo: UpdateTodoRequest, userId: string, todoId: string): Promise<TodoItem> {
  const result = await docClient.update({
      TableName: todosTable,
      Key: { 
        todoId: todoId, 
        userId: userId 
      },
      ExpressionAttributeNames: {"#todoName": "name"},
      UpdateExpression: "set #todoName = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeValues: {
          ":name": updatedTodo.name,
          ":dueDate": updatedTodo.dueDate,
          ":done": updatedTodo.done,
      },
  }).promise()
    
  return result.Attributes as TodoItem   
}
export async function deleteTodo(userId: string, todoId: string) {
  const params = {
    TableName: todosTable,
    Key: {
      "userId": userId,
      "todoId": todoId
    }
  }
  await docClient
    .delete(params, function (err, data) {
      if (err) {
        console.error('Unable to delete todo item.', JSON.stringify(err))
      } else {
        console.log('todo item deleted successfully!', JSON.stringify(data))
      }
    })
    .promise()
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

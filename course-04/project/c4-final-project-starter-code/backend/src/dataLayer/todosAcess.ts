import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly logger = createLogger('TodosAccess')

  ){}
// TODO: Implement the dataLayer logic
async createTodo(todo: TodoItem): Promise<TodoItem> {
  await this.docClient
    .put({
      TableName: this.todosTable,
      Item: todo
    })
    .promise()
    this.logger.info(`Create and return todo item`);
  return todo
}
async getAllTodosByUserId(userId: string): Promise<TodoItem[]> {
  const result = await this.docClient
    .query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()
  return result.Items as TodoItem[]
}
async getTodoById(todoId: string): Promise<TodoItem> {
  const result = await this.docClient
    .query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      }
    })
    .promise()
    this.logger.info(`Get todo itemby todo id ${todoId}`);
  if (result.Items.length !== 0) {
    return result.Items[0] as TodoItem
  }

  return null
}
async getTodoByUserId(
  userId: string,
  todoId: string
): Promise<TodoItem[]> {
  const result = await this.docClient
    .query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId
      }
    })
    .promise()

  return result.Items as TodoItem[]
}

async updateTodoAttachment(todo: TodoItem): Promise<TodoItem> {
  const result = await this.docClient
    .update({
      TableName: this.todosTable,
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
async updateTodo(updatedTodo: UpdateTodoRequest, userId: string, todoId: string): Promise<TodoItem> {
  const result = await this.docClient.update({
      TableName: this.todosTable,
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
async deleteTodo(userId: string, todoId: string) {
  const params = {
    TableName: this.todosTable,
    Key: {
      "userId": userId,
      "todoId": todoId
    }
  }
  await this.docClient
    .delete(params, function (err, data) {
      if (err) {
        console.error('Unable to delete todo item.', JSON.stringify(err))
      } else {
        console.log('todo item deleted successfully!', JSON.stringify(data))
      }
    })
    .promise()
}

// async createDynamoDBClient() {
//   if (process.env.IS_OFFLINE) {
//     console.log('Creating a local DynamoDB instance')
//     return new XAWS.DynamoDB.DocumentClient({
//       region: 'localhost',
//       endpoint: 'http://localhost:8000'
//     })
//   }

//   return new XAWS.DynamoDB.DocumentClient()
// }
}
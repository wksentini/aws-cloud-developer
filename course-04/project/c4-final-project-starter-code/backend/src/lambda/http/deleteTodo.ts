import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../utils'
import { deleteTodo, getTodoByUserId } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    console.log('user Id:', userId)
    const todo = await getTodoByUserId(userId, todoId)
    // DONE: Remove a TODO item by id
    if (todo.length === 0){
      console.log('Incorrect todo ID: ', todoId)
      return {
        statusCode: 404,
        body: 'todo Id does not exist'
      }
    }
    await deleteTodo(userId, todoId)
    return {
      statusCode: 200,
      body: ''
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

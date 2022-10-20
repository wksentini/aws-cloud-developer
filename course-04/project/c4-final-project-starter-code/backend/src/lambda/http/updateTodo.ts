import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

// import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { getTodoByUserId, updateTodo } from '../../businessLogic/todos'
// import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const todoItem = await getTodoByUserId(userId, todoId)
    if (todoItem.length === 0) {
      return {
        statusCode: 404,
        body: 'todo Id does not exist'
      }
    }

    const items = await updateTodo(updatedTodo, userId, todoId)
    return {
      statusCode: 200,
      body: JSON.stringify(items)
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)

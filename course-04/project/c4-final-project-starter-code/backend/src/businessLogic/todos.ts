// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { getUserId } from '../lambda/utils';
import { TodoAccess } from '../dataLayer/todosAcess';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

// TODO: Implement businessLogic
const todoAccess = new TodoAccess()
const logger = createLogger('Todos')
export function buildTodo(todoRequest: CreateTodoRequest, event): TodoItem{
    const todo = {
        todoId: uuid.v4(),
        createdAt: new Date().toISOString(),
        userId: getUserId(event),
        done: false,
        attachmentUrl: '',
        ...todoRequest
    }
    logger.info(`Build and return todo item`);
    return todo;
}
export async function deleteTodo(userId: string, todoId: string){
    logger.info(`Delete todo item with Id: ${todoId} of user: ${userId}`);
    return await todoAccess.deleteTodo(userId, todoId);
}
export async function getTodoByUserId(userId: string, todoId: string){
    logger.info(`Get todo item with Id: ${todoId} of user: ${userId}`);
    return await todoAccess.getTodoByUserId(userId, todoId);
}
export async function createTodo(todo: TodoItem){
    logger.info(`Create todo item with Id: ${todo.todoId} of user: ${todo.userId}`);
    return await todoAccess.createTodo(todo);
}
export async function getTodoById(todoId: string){
    logger.info(`Get todo item with Id: ${todoId}`);
    return await todoAccess.getTodoById(todoId);
}
export async function updateTodoAttachment(todo: TodoItem){
    logger.info(`Update todo image for todo item with Id: ${todo.todoId} of user: ${todo.userId}`);
    return await todoAccess.updateTodoAttachment(todo);
}
export async function updateTodo(updatedTodo: UpdateTodoRequest, userId: string, todoId: string){
    logger.info(`Update todo item with Id: ${todoId} of user: ${userId}`);
    return await todoAccess.updateTodo(updatedTodo, userId, todoId);
}
export async function getAllTodosByUserId(userId: string){
    logger.info(`Get all todo items of user: ${userId}`);
    return await todoAccess.getAllTodosByUserId(userId);
}
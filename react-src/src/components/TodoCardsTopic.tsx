import React, { useState } from "react";
import "./todo-cards-topic.css";
import { TodoElement } from "../viewModels/TodoModel";
import { DefaultTodoElement, reverseTodoId } from "./TodoDataModel";
import { os } from "@neutralinojs/lib";

const menuStyle = {
  flexGrow:"1"
} as any

/**
 * display menu at page todo topic
 * @param props 
 * @returns 
 */
const TopLevelMenu = (props) => {
  const topLevelElements = props.topLevelElements as TodoElement[]
  const cursor = props.cursor as number
  const updateOptions = (event) => {
    props.updatePageTodoId(event.target.value)
  }
  return (
    <select className="top-level-menu" value={cursor} onChange={updateOptions}>
      {topLevelElements.map((value) => <option key={value.id} value={value.id}>{value.title}</option>)}
    </select>
  )
}

/**
 * shows page todo topic title, can be a menu or a text area
 * @param props 
 * @returns 
 */
const TopicTitle = (props) => {
  const todoElement = props.todoElement as TodoElement

  const updateTitle = (event) => {
    todoElement.title = event.target.value
    props.updatePageTodoId(todoElement.id)
  }

  if (todoElement.parent == -1) {
    const topLevelElements = props.topLevelElements as TodoElement[]
    const cursor = topLevelElements.findIndex((value) => (value.id == todoElement.id) )
    return <TopLevelMenu {...props} cursor={cursor}/>
  }
  else {
    return (<input className="todo-title" placeholder="TODO　TITLE" value={todoElement.title} onChange={updateTitle}/>)
  }
}


export const TodoTopicCard = (props) => {
  const TodoTable = props.model.TodoTable
  const todoElement = props.todoElement as TodoElement

  const addTodo = () => {
    const subElement = DefaultTodoElement(TodoTable, todoElement.id)
    props.model.updateElements([subElement])
  }

  const toParent = () => {
    const parent = TodoTable.find((value, _, __) => (value!=undefined) && (todoElement.parent==value.id) )
    if (parent != undefined) {
      props.updatePageTodoId(parent.id)
    }
  }

  // clear the topic todo, except delete todo and default todo
  const clearAll = async () => {
    const idList = props.childrenElements.map((value) => value.id)
    // not reverse TodoElement, then remove topic 
    if (Object.values(reverseTodoId).find((e)=>(e.id==todoElement.id))==undefined) {
      console.log("is not reverse Todo")
      idList.push(todoElement.id)
    }

    props.page.overlayPage(true)
    if (todoElement.id == reverseTodoId.Recycler.id) {
      const res = await os.showMessageBox("Drop Confirm", "Do you want to delete all Todos in Recycle Bin (it is Unrecoverable)?", os.MessageBoxChoice.OK_CANCEL)
      if (res=="OK") props.model.dropElements(idList)
      props.updatePageTodoId(reverseTodoId.Recycler.id)
    } else {
      const res = await os.showMessageBox("Drop Confirm", "Do you want to delete all Todos (to Recycle Bin)?", os.MessageBoxChoice.OK_CANCEL)
      if (res=="OK") props.model.deleteElements(idList)
      props.updatePageTodoId(reverseTodoId.Default.id)
    }
    props.page.overlayPage(false)
  }

  const stickToDesktop = (event) => {
    
  }

  var displayStyle = {}
  displayStyle['visibility'] = todoElement.parent == null ? 'hidden' : 'visible'


  return (
    <div className="todo-topic-card">
      <a href="#" className="return-btn" style={displayStyle} onClick={toParent} >angle-left</a>
      <TopicTitle {...props}/>
      <a href="#" className="btn">paperclip</a>
      <a href="#" className="btn" onClick={addTodo}>plus</a>
      <a href="#" className="btn" onClick={clearAll}>trash</a>
    </div>
  );


}
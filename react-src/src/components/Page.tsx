import React, { useState } from "react";

import { FinishedCardsTopic, TodoCard, TodoTopicCard } from ".";
import { getTopLevelElements, reverseTodoId } from ".";
import "./page.css"
import { TodoElement } from "../viewModels/TodoModel";

const divStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    position: "relative",
    width: "100%"
} as any

// FIXME: top level element jump to Default Todo topic (happened only when it is custom top level todo element, Default Todo and recycle bin todo not affected)
// TODO: add a way to add new top level todo

/**
 * a new todo page
 */
export const TodoPage = (props) => {
    const TodoTable = props.model.TodoTable


    const [todoId, updateTodoId] = useState(reverseTodoId.Default.id)
    const [pageUpdateSign, forceUpdatePage] = useState(0)
    const [useOverlay, setUseOverlay] = useState(false)

    /**
     * update page Todo element id, force render page again
     * @param newTodoId new TodoId
     */
    const forceUpdate = (newTodoId:number) => {
        updateTodoId(newTodoId)
        forceUpdatePage(pageUpdateSign + 1)
    }

    const todoElement = TodoTable[todoId]
    if (todoElement===null  || todoElement===undefined) return

    const topLevelElements = getTopLevelElements(TodoTable)

    const pageScope = {
        overlayPage: setUseOverlay
    }

    const selectChildren = () => {
        if (todoElement.id == reverseTodoId.Recycler.id) return TodoTable.filter((value:TodoElement) => (value!=undefined) && value.deleted )
        return TodoTable.filter((value:TodoElement) => (value!=undefined) && (value.parent == todoElement.id) && (!value.deleted) )
    }
    const mapTodoElementToJSX = (elements) => elements.map((value: TodoElement) => {
        return <TodoCard key={value.id} element={value} parent={todoElement} {...props} updatePageTodoId={forceUpdate} page={pageScope}/>
    })

    const childrenElements = selectChildren().sort((a:TodoElement,b:TodoElement) => a.createTime-b.createTime) // sort by time
    const notFinishedElements = childrenElements.filter((v:TodoElement) => !v.finished)
    const finishedElements = childrenElements.filter((v:TodoElement) => v.finished)

    const todoCards = mapTodoElementToJSX(notFinishedElements)
    const finishedCards = mapTodoElementToJSX(finishedElements)

    const todoCardTopic = <TodoTopicCard todoElement={todoElement} {...props} topLevelElements={topLevelElements} childrenElements={childrenElements} updatePageTodoId={forceUpdate} page={pageScope}/>


    const overlayStyle = {
        width: "100%",
        height: "100%",
        top: "0px",
        left: "0px",
        backgroundColor: "rgba(0,0,0,0.5)",
        position:"absolute",
        visibility: useOverlay?"visible":"hidden",
    } as any

    const comp = (
    <div style={{width:"100%"}}>
    <div className="Page">
        <div style={divStyle}>
            {todoCardTopic}
            {todoCards}
        </div>

        <div style={divStyle}>
            <FinishedCardsTopic />
            {finishedCards}
        </div>
    </div>

    <div style={overlayStyle}></div>
    </div>) as any


    

    return (comp)
}





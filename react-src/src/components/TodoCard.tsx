import React, { useRef, useEffect } from "react";
import "./todo-card.css";
import { TodoElement } from "../viewModels/TodoModel";
import { reverseTodoId as ReverseTodo } from "./TodoDataModel";


const timeLabelStyle = {
  fontSize: "14px",
  fontWeight: "200",
  fontFamily: "Inter-Regular, Helvetica",
  color: "rgba(100, 100, 100, 1)"
} as React.CSSProperties

const getDateStr = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}`
}

const updateTextAreaHeight = (element) => {
  if (element.scrollHeight > element.clientHeight) {
    element.style.height = element.scrollHeight + "px"
  }
}


const TodoCard = (props) => {
  const cardElement = props.element as TodoElement

  const date = getDateStr(cardElement.createTime)

  const elementWithChildren = props.model.getChildren(cardElement.id).concat(cardElement) as TodoElement[]

  // get finished elements num
  const totalNum = elementWithChildren.length
  const finishedNum = elementWithChildren.filter(e => e.finished).length

  const onDelete = () => {
    if (!cardElement.deleted) {
      props.model.deleteElements([cardElement.id])
    } else {
      props.model.dropElements([cardElement.id])
    }
    props.updatePageTodoId(props.parent.id)
  }

  const openAsPage = () => {
    if (!cardElement.deleted) props.updatePageTodoId(cardElement.id)
  }

  // update title, also update its display
  const updateTitle = (event) => {
    updateTextAreaHeight(event.target)
    cardElement.title = event.target.value
    props.model.updateElements([cardElement])
    props.updatePageTodoId(props.parent.id)
  }

  const setFinish = (event) => {
    const cardElementFinished = cardElement.finished

    const parents = props.model.getParents(cardElement.id) as TodoElement[]
    if (cardElementFinished) parents.forEach(e => {e.finished = false})

    // if root card element finish is true, root card and all its children finished state set to false
    // else set to true
    elementWithChildren.forEach(element => {
      element.finished = !cardElementFinished
    });

    props.model.updateElements(elementWithChildren.concat(parents))
    props.updatePageTodoId(props.parent.id)
  }

  const recoverDeleteElement = (event) => {
    if (!cardElement.deleted) return
    // if can find a parent tree contains it, recover the whole parent tree
    // parent tree: should have top level TodoElement, which means its parent id is -1
    // else recover to default todo container
    const parents = props.model.getParents(cardElement.id) as TodoElement[]
    const completeParentsTree = parents.findIndex(e => e.parent===-1) !== -1
    if (completeParentsTree) {
      parents.forEach(e => {e.deleted=false})
      cardElement.deleted = false
      props.model.updateElements(parents.concat(cardElement))
    } else {
      cardElement.parent = ReverseTodo.Default.id
      cardElement.deleted = false
      props.model.updateElements([cardElement])
    }
    
    props.updatePageTodoId(props.parent.id)
  }

  


  const backgroundColor = cardElement.finished ? "finished" : "not-finished"
  
  const updateFinishBtnCode = cardElement.finished ? "undo" : "check"

  const reactCompTool = cardElement.deleted ?
    (<div className="tools">
      <a href="#" className="" onClick={recoverDeleteElement}>undo</a>
      <a href="#" className="" onClick={onDelete}>trash</a>
    </div>) : 
    (<div className="tools">
      <label className="progress-text">{finishedNum}/{totalNum}</label>
      <a href="#" className="" onClick={setFinish}>{updateFinishBtnCode}</a>
      <a href="#" className="delete-icon" onClick={onDelete}>trash</a>
      <a href="#" className="subdir-icon" onClick={openAsPage} >angle-right</a>
    </div>)

  const topicProps = {
    className: `todo-title ${backgroundColor}`,
    name: "title",
    placeholder: "TODO TOPIC" ,
    value: cardElement.title,
    onChange: updateTitle,
    onClick: (event)=> {updateTextAreaHeight(event.target)}
  }
  const cardTopicComp = cardElement.finished ? <p {...topicProps}>{cardElement.title}</p> : <textarea {...topicProps}/>
  


  return(
    <div className={`todo-card ${backgroundColor}`}>
      {cardTopicComp}
      <div style={{
        display:"flex",
        flexDirection: "column",
        alignItems: "end",
        gap: "8px"
      }}>
        {reactCompTool}
        <label style={timeLabelStyle}>{date}</label>
      </div>
    </div>
  )
}

export {TodoCard}
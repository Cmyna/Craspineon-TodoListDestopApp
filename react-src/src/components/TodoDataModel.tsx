import React, { useState,useEffect } from "react";
import { filesystem, os } from "@neutralinojs/lib"
import { TodoElement } from "../viewModels/TodoModel";

const defaultTableFileName = "DefaultTable.json"

const isTodoElement = (jsObj) => {
    return jsObj != null &&
    jsObj != undefined &&
    typeof jsObj.title == "string" &&
    typeof jsObj.createTime == "number" &&
    typeof jsObj.parent == "number" &&
    typeof jsObj.id == "number" &&
    typeof jsObj.deleted == "boolean"
}




export const reverseTodoId = {
    Default: {id:0, title:"Default Todo"},
    Recycler: {id:1, title:"Recycle Bin"},
    // Finished: {id:2, title:"Finished Todo"},
}

const getTodoDataDir = async ():Promise<string> => {
    const roamingDir = await os.getPath("data")
    const todoDir = roamingDir + "/CraspineonTodo"
    // check dir created or not, if not create one
    await filesystem.readDirectory(todoDir).catch(async (err) => {
        await filesystem.createDirectory(todoDir)
    }).finally(() => {
        return todoDir
    })
    return todoDir
}


const newRootTodoElement = (idIn:number, titleIn:string) => {
    return {
        title: titleIn,
        createTime: Date.now(),
        parent: -1,
        id: idIn,
        deleted: false,
        finished: false,
        finishTime: -1
    }
}

/**
 * restore reverse Todo Container if table dont have
 * the function will create missing Todo and add it to table
 * @param table the TodoElement table to be modified
 */
const restoreReverseContainer = (table: TodoElement[]) => {
    const restoreHelper = (reverseId: number, title:string) => {
        if (!isTodoElement(table[reverseId])) table[reverseId] = newRootTodoElement(reverseId, title)
        table[reverseId].title = title
    }
    Object.entries(reverseTodoId).forEach(([_, spec]) => {
        restoreHelper(spec.id, spec.title)
    })
}

/**
 * load all TodoElement from local storage
 * @returns 
 */
const loadAllTodoData = async (todoDirPromise:Promise<string>) => {
    const todoDir = await todoDirPromise

    let files = await filesystem.readDirectory(todoDir)
    files = files.filter((value, _, __) => (value.type === "FILE") && (value.entry.endsWith(".json")) )
    
    const table = (await Promise.all(files.map(async (file, _, __) => {
        return filesystem.readFile(todoDir + "/" + file.entry)
    })))
        .map((str, _, __) => JSON.parse(str))
        .filter((jsObj, _, __) => {
            return Array.isArray(jsObj)
        })
        .flatMap((arr, _, __) => arr)
        .filter((element, _, __) => isTodoElement(element))
    
    const orderedTable = []
    table.forEach((e) => orderedTable[e.id] = e)

    return orderedTable
}


const wrtieToLocalStorage = async (todoDirPromisze:Promise<string>, table: TodoElement[]) => {
    const todoDir = await todoDirPromisze
    const jsonStr = JSON.stringify(table)
    await filesystem.writeFile(todoDir+"/"+defaultTableFileName, jsonStr)
}

/**
 * get decendant to the element specified by id passed in (by check TodoElement.parent property)
 * @param table table stores all element
 * @param id 
 * @returns a list of all decendant TodoElement
 */
const _getChildren = (table: TodoElement[], id:number):TodoElement[] => {
    const element = table[id]
    if (!isTodoElement(element)) return []
    const directChildren = table.filter((v, _, __) => isTodoElement(v) && v.parent==element.id)
    return directChildren.concat(directChildren.flatMap((v, _, __) => _getChildren(table, v.id)) )
}


/**
 * this React function element represents the front data model layer,
 * contains TodoElement table.
 * 
 * its props accept a React element called pageElement use for rendering a Todo page
 */
export const TodoDataModel = (props) => {
    const [TodoTable, updateTodoTable] = useState([])
    const [firstInitSign, setInitSign] = useState(true) // sign to check is first init or not
    

    // setup effect
    useEffect(() => {
        const todoDir = getTodoDataDir()
        if (firstInitSign) {
            console.log("model setup")
            loadAllTodoData(todoDir).then((table) => {
                // check has default and delete container or not
                restoreReverseContainer(table)
                updateTodoTable(table)
                setInitSign(false)
            })
        } else { // in general, update table to local storage
            wrtieToLocalStorage(todoDir, TodoTable)
        }
    })


    // table operate functions
    const updateElements = (elements: TodoElement[]) => {
        const newTable = TodoTable.slice()
        elements.forEach((e) => newTable[e.id] = e)
        updateTodoTable(newTable)
    }
    const dropElements = (ids:number[]) => {
        const availableId = ids.filter((id) => isTodoElement(TodoTable[id]))
        const newTable = TodoTable.slice()
        availableId.forEach((id) => newTable[id] = undefined)
        updateTodoTable(newTable)
    }
    const deleteElements = (ids:number[]) => {
        const newTable = TodoTable.slice()
        const availableId = ids.filter((id) => isTodoElement(TodoTable[id]))
        
        // get element and its child
        const toBeDeletedElements = availableId.flatMap((id) => {
            return _getChildren(newTable, id).concat(newTable[id])
        })
        toBeDeletedElements.forEach(v => {
            v.deleted = true
            newTable[v.id] = v
        });
        
        updateTodoTable(newTable)
    }
    const getChildren = (id: number) => {
        return _getChildren(TodoTable, id)
    }
    // return all its parents by id
    const getParents = (id: number):TodoElement[] => {
        const parent = TodoTable[TodoTable[id].parent]
        if (parent===undefined || parent===null) return []
        return getParents(parent.id).concat(parent)
    }


    // props addon
    const modelScope = {
        TodoTable:TodoTable,
        dropElements: dropElements,
        deleteElements: deleteElements,
        updateElements: updateElements,
        getChildren: getChildren,
        getParents: getParents
    }


    const page = React.cloneElement(props.pageElement, {model: modelScope})
    return page
    //return props.pageElement
}

export const getTopLevelElements = (table: TodoElement[]) => {
    return table.filter( (value, _, __) => (value != undefined) && (value.parent == -1) && (!value.deleted) )
}

const getAvailableSlot = (table: TodoElement[]) => {
    let i = table.findIndex((v, _, __) => v===null || v===undefined)
    return i!=-1 ? i : table.length
}


export const DefaultTodoElement = (table: TodoElement[], parentId:number) => {
    return {
        title:"",
        createTime: Date.now(),
        parent: parentId,
        id:getAvailableSlot(table),
        deleted: false
    } as TodoElement
}
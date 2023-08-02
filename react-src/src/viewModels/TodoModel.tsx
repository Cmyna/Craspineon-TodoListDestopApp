export type TodoElement = {
    title:string
    createTime:number
    parent:number /** if parent id==-1 then no parent */
    id:number /** primary key */
    deleted:boolean
    finished:boolean
    finishTime:number
}







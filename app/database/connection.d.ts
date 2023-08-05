export type typeDB = {
  MYSQL: String,
  SQLITE: String,
}

export const DBTYPE: typeDB

export class Database {
  constructor(host: string)

  public connection
  protected type

  public execute(query: string, args: any[])

  protected isSelect(query: string): boolean
  protected isInsert(query: string): boolean
  protected isUpdate(query: string): boolean
  protected isDelete(query: string): boolean
}
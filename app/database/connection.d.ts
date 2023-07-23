export const DBTYPE = {
  MYSQL: String,
  SQLITE: String,
}

export class Database {
  constructor(host: string)

  public connection
  protected type

  public execute(query: string, args: any[])
}
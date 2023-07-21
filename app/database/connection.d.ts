export const DBTYPE = {
  MYSQL: String,
  SQLITE: String,
}

export class Database {
  constructor(host: string)

  public connection
  protected type

  public execute(query: string, args: any[])
  protected mysqlExec(query: string, args: any[], callback: (err: error, results: any) => any)
  protected sqliteExec(query: string, args: any[], callback: (results: any, err: error) => any)
}
export class Database {
  constructor(host: string)

  connection

  execute(query: string, args: any[])
}
import { DataSource, Repository } from "typeorm";

export default class DataSourceConnection {
  static instance: DataSourceConnection;
  private dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: +process.env.DB_PORT || 5432,
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "measure_db",
      entities: ["src/database/entities/*.ts"],
      synchronize: true,
      logging: false,
    });

    this.dataSource
      .initialize()
      .then(() => {
        console.log("Data Source has been initialized!");
      })
      .catch((error) => {
        console.error("Error during Data Source initialization", error);
      });
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new DataSourceConnection();
    }

    return this.instance;
  }

  public getRepository<T>(repositoryName: string): Repository<T> {
    return this.dataSource.getRepository(repositoryName);
  }
}

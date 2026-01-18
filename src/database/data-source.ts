import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { typeormConfig } from '../config/typeorm.config';

// TypeORM CLI expects exactly one DataSource export
const dataSource = new DataSource({
  ...typeormConfig,
  synchronize: false,
  logging: false,
});

export default dataSource;

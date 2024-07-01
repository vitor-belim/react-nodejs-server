export default interface SequelizeObject<T> {
  destroy(): Promise<boolean>;

  update(obj: T): Promise<void>;
}

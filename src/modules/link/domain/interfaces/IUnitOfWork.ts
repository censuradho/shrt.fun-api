export interface IUnitOfWork<TRepositories> {
  run<T>(work: (repos: TRepositories) => Promise<T>): Promise<T>;
}

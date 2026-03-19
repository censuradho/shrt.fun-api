import { UrlController } from '../controller/url.controller';
import { CreateUrlUseCase } from '@/application/useCases/CreateUrl.useCase';
import { IUrlRepository } from '@/domain/repositories/IUrlRepository';
import { CacheGateway } from '@/domain/interfaces/CacheGateway';
import { IEnvProvider } from '@/domain/services/EnvProvider';

// Importe ou instancie as dependências reais conforme sua arquitetura
const urlRepository: IUrlRepository = /* instância real */;
const cache: CacheGateway = /* instância real */;
const envProvider: IEnvProvider = /* instância real */;

export function makeUrlController() {
  const createUrlUseCase = new CreateUrlUseCase(urlRepository, cache, envProvider);
  return new UrlController(createUrlUseCase);
}

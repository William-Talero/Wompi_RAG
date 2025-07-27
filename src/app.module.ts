import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './presentation/modules/document.module';
import { SearchModule } from './presentation/modules/search.module';
import { HealthModule } from './presentation/modules/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DocumentModule,
    SearchModule,
    HealthModule,
  ],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { TerminusModule } from '@nestjs/terminus' 
import { HealthModule } from './healthcheck/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: cfg.get<'postgres'>('DATABASE_TYPE', 'postgres'),
        host: cfg.get<string>('DATABASE_HOST'),
        port: cfg.get<number>('DATABASE_PORT'),
        username: cfg.get<string>('DATABASE_USERNAME'),
        password: cfg.get<string>('DATABASE_PASSWORD'),
        database: cfg.get<string>('DATABASE_DATABASE'),
        autoLoadEntities: true,
        synchronize: cfg.get('DATABASE_SYNCHRONIZE') === 'true',
        logging: cfg.get('DATABASE_LOGGING') === 'true',
      }),
    }),
    TerminusModule,
    UsersModule,
    RolesModule,
    HealthModule
  ],
})
export class AppModule {}

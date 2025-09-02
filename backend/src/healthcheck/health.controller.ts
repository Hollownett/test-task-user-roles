import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckService,
} from '@nestjs/terminus'

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
  ) {}

  @Get('live')
  live() {
    return { status: 'ok' }
  }
  
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([])
  }
}

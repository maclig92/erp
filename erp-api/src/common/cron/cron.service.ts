import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, CacheTTL } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Interval } from '@nestjs/schedule';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CronService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}
  @CacheTTL(30 * 60 * 1000)
  @Interval(30 * 60 * 1000)
  async refreshExpiredTokensCache() {
    console.log('Refreshing blacklisted token in cache.');
    await this.cacheManager.del(
      this.configService.get('CACHE_BLACKLISTED_TOKENS_KEY'),
    );
    await this.authService.removeExpiredTokens();
    const tokens = await this.authService.getBlackListedTokens();
    await this.cacheManager.set(
      this.configService.get('CACHE_BLACKLISTED_TOKENS_KEY'),
      tokens,
    );
  }
}

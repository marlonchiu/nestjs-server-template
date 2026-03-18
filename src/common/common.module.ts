import { Module, Global } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { OwnershipGuard } from './guards/ownership.guard';

@Global()
@Module({
  providers: [AuthGuard, OwnershipGuard],
  exports: [AuthGuard, OwnershipGuard],
})
export class CommonModule {}

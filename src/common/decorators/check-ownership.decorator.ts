import { SetMetadata } from '@nestjs/common';
import { CHECK_OWNERSHIP_KEY } from '../guards/ownership.guard';

export const CheckOwnership = () => SetMetadata(CHECK_OWNERSHIP_KEY, true);

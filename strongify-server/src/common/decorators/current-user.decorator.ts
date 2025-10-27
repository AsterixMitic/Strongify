import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string  => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.user?.userId;
    
    if (!userId) {
      throw new BadRequestException('Invalid or missing user id in JWT');
    }

    return String(userId);
  },
);


import { OmitType } from '@nestjs/swagger';
import { Item } from '@/schemas/item.schema';

export class CreateItemReqDto extends OmitType(Item, ['_id', 'createdAt', 'updatedAt'] as const) {}
export class UpdateItemReqDto extends OmitType(Item, ['_id', 'createdAt', 'updatedAt'] as const) {}

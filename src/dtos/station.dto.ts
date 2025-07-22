import { OmitType } from '@nestjs/swagger';
import { Station } from '@/schemas/station.schema';

export class CreateStationReqDto extends OmitType(Station, ['_id', 'createdAt', 'updatedAt'] as const) {}
export class UpdateStationReqDto extends OmitType(Station, ['_id', 'createdAt', 'updatedAt'] as const) {}

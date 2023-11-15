import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class PrivateConversationDTO {
  @ApiProperty({ type: String, description: 'Title' })
  @IsOptional()
  title?: string;

  @ApiProperty({ type: String, description: 'Participation user ID' })
  @IsString()
  participationUserId: string;
}

export class GroupConversationDTO {
  @ApiProperty({ type: String, description: 'Title Group' })
  @IsOptional()
  title?: string;

  @ApiProperty({ type: Array, description: 'Participation user ID list' })
  @IsArray()
  participationUserId: string[];
}

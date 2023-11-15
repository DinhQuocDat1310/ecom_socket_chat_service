import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MessageDTO {
  @ApiProperty({ type: String, description: 'Conversation ID' })
  @IsString()
  conversationId: string;

  @ApiProperty({ type: String, description: 'Message' })
  @IsString()
  messageText: string;
}

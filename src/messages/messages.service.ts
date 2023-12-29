import {
  Injectable,
  Inject,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  NOTIFICATION_NEW_MESSAGE,
  NOTIFICATION_SERVICE,
  USER_SERVICE,
} from './constants/service';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import { PrismaService } from 'src/prisma/service';
import {
  PrivateConversationDTO,
  GroupConversationDTO,
} from './dto/conversation.dto';
import { MemberRole, MessageStatus, TypeConversation } from '@prisma/client';
import { MessageDTO } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    private readonly prismaService: PrismaService,
  ) {}

  findUserByEmailOrPhoneNumber = async (username: string): Promise<any> => {
    // Send message to user-microservice to notify them we need to find user by email or phonenumber
    return await lastValueFrom(
      this.userClient.send('find_user_by_email_or_phone', username),
    );
  };

  createPrivateConversation = async (
    user: any,
    conversationDto: PrivateConversationDTO,
  ): Promise<any> => {
    const { title, participationUserId } = conversationDto;
    const userExited = await this.participationUserExisted(participationUserId);
    if (!userExited)
      throw new BadRequestException('Participant userId not found');
    const checkConversationExisted = await this.checkPrivateConversationExisted(
      user.id,
      participationUserId,
    );
    if (checkConversationExisted)
      throw new BadRequestException(
        `Your conversation with ${participationUserId} is already established`,
      );
    await this.prismaService.conversation.create({
      data: {
        title:
          title ??
          `Private conversation of ${user.id} and ${participationUserId}`,
        creatorId: user.id,
        type: TypeConversation.PRIVATE,
        participant: {
          create: {
            userId: participationUserId,
          },
        },
      },
    });
  };

  checkPrivateConversationExisted = async (
    creatorId: string,
    participationUserId: string,
  ): Promise<boolean> => {
    try {
      const isCreator = await this.prismaService.conversation.findFirst({
        where: {
          creatorId,
          type: TypeConversation.PRIVATE,
          participant: {
            every: {
              userId: participationUserId,
            },
          },
        },
      });
      const isParticipator = await this.prismaService.conversation.findFirst({
        where: {
          creatorId: participationUserId,
          type: TypeConversation.PRIVATE,
          participant: {
            every: {
              userId: creatorId,
            },
          },
        },
      });
      if (isCreator || isParticipator) return true;
      return false;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  participationUserExisted = async (userId: string) => {
    // Send message to user-microservice to notify them we need to find user by userId
    return await lastValueFrom(this.userClient.send('find_user_by_id', userId));
  };

  findConversationByTitle = async (user: any, title: string): Promise<any> => {
    try {
      return await this.prismaService.conversation.findMany({
        where: {
          OR: [
            {
              creatorId: user.id,
            },
            {
              participant: {
                every: {
                  userId: user.id,
                },
              },
            },
          ],
          title: {
            contains: title,
          },
        },
        include: {
          participant: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  createGroupConversation = async (
    user: any,
    conversationDTO: GroupConversationDTO,
  ): Promise<any> => {
    const { participationUserId, title } = conversationDTO;
    await this.validationGroupConversation(user.id, conversationDTO);
    try {
      const conversation = await this.prismaService.conversation.create({
        data: {
          creatorId: user.id,
          title: title ?? `Group conversation of ${user.username}`,
          type: TypeConversation.GROUP,
        },
      });
      const participant = await Promise.all(
        participationUserId.map(async (userId) => {
          return await this.prismaService.participant.create({
            data: {
              userId,
              memberRole: MemberRole.MEMBER,
              conversation: {
                connect: {
                  id: conversation.id,
                },
              },
            },
          });
        }),
      );
      return participant;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  validationGroupConversation = async (
    creatorId: string,
    conversationDTO: GroupConversationDTO,
  ): Promise<any> => {
    const conversation =
      await this.checkGroupConversationExistedWithParticipator(
        creatorId,
        conversationDTO,
      );
    if (conversation)
      throw new BadRequestException(
        'Your conversation with all participants was established',
      );
    const userExistedChecks = await Promise.all(
      conversationDTO.participationUserId.map(async (userId) => {
        return await this.participationUserExisted(userId);
      }),
    );
    const userExited = userExistedChecks.every((result) => result);
    if (!userExited)
      throw new BadRequestException('Participant userId not found');
  };

  checkGroupConversationExistedWithParticipator = async (
    creatorId: string,
    conversationDTO: GroupConversationDTO,
  ) => {
    try {
      const { participationUserId, title } = conversationDTO;
      const conversation = await this.prismaService.conversation.findFirst({
        where: {
          creatorId,
          title,
          type: TypeConversation.GROUP,
        },
        select: {
          participant: {
            select: {
              userId: true,
            },
          },
        },
      });
      const listParticipators = conversation?.participant
        .filter((participate) => participate?.userId)
        .filter((user) => participationUserId.includes(user?.userId));

      if (!listParticipators && !conversation?.participant) return false;
      if (listParticipators?.length === conversation?.participant?.length)
        return true;
      return false;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  createMessage = async (user: any, messageDto: MessageDTO): Promise<any> => {
    const { messageText, conversationId } = messageDto;
    await this.checkAllConversationExisted(user.id, conversationId);

    try {
      const message = await this.prismaService.$transaction(
        async (prisma: PrismaService) => {
          return await prisma.message.create({
            data: {
              senderId: user.id,
              message: messageText,
              messageStatus: MessageStatus.SEND,
              conversation: {
                connect: {
                  id: conversationId,
                },
              },
            },
            select: {
              id: true,
              senderId: true,
              message: true,
              conversationId: true,
              messageStatus: true,
            },
          });
        },
      );
      //Get all participants in conversation to notifications
      const members = await this.prismaService.participant.findMany({
        where: {
          conversation: {
            every: {
              id: message.conversationId,
            },
          },
        },
      });

      //[Send Message] - Push notification
      user['notify_type'] = NOTIFICATION_NEW_MESSAGE;
      user['messages'] = message;
      user['members'] = members;
      await lastValueFrom(
        this.notificationClient.emit('send_notification_to_another', user),
      );
      return message;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  checkAllConversationExisted = async (
    creatorId: string,
    conversationId: string,
  ): Promise<any> => {
    const conservation = await this.prismaService.conversation.findFirst({
      where: {
        OR: [
          {
            creatorId,
          },
          {
            participant: {
              every: {
                userId: creatorId,
              },
            },
          },
        ],
        id: conversationId,
      },
    });
    if (!conservation)
      throw new BadRequestException('Conservation ID not found');
  };
}

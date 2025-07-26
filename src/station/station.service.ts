import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SYSTEM_USE_ONLY_STATION_GROUP_CODENAME,
  SYSTEM_USE_ONLY_STATION_GROUP_NAME,
} from '@/common/consts/station-group.const';
import { SYSTEM_USE_ONLY_STATION_CODENAME, SYSTEM_USE_ONLY_STATION_NAME } from '@/common/consts/station.const';
import { SkillCardEnum } from '@/common/enums/skill-card.enum';
import { StationDifficultyEnum } from '@/common/enums/station-difficulty.enum';
import { StationPositionEnum } from '@/common/enums/station-position.enum';
import { CreateStationReqDto, UpdateStationReqDto } from '@/dtos/station.dto';
import { WithPinDto } from '@/dtos/with-pin.dto';
import { StationGroup } from '@/schemas/station-group.schema';
import { StationCheckinHistoryRepository } from '@/station/station-checkin-history.repository';
import { StationRepository } from '@/station/station.repository';
import { TeamRepository } from '@/team/team.repository';

@Injectable()
export class StationService {
  private readonly logger = new Logger(StationService.name);

  constructor(
    private readonly stationRepository: StationRepository,
    private readonly stationCheckinHistoryRepository: StationCheckinHistoryRepository,
    private readonly teamRepository: TeamRepository,
    @InjectModel(StationGroup.name)
    private readonly stationGroupModel: Model<StationGroup>,
  ) {
    void (async () => {
      await this.seedStationsAndStationGroups();
    })();
  }

  async seedStationsAndStationGroups() {
    // Check if the database is already seeded
    const existingGroups = await this.stationGroupModel.countDocuments().exec();
    if (existingGroups > 0) {
      this.logger.log('Database already seeded with station groups and stations.');
      return; // Exit if already seeded
    }

    // Clear station groups and stations
    await this.stationGroupModel.deleteMany({}).exec();
    await this.stationRepository.deleteAllStations();

    // Create station groups
    const stationGroups: StationGroup[] = [
      // Dealing when using coin updates with station group, and super admin station can use this group.
      {
        name: SYSTEM_USE_ONLY_STATION_GROUP_NAME,
        codename: SYSTEM_USE_ONLY_STATION_GROUP_CODENAME,
        position: StationPositionEnum.KHTN_THSG,
      },
      {
        name: 'Blockchain',
        codename: 'blockchain',
        position: StationPositionEnum.THSG,
      },
      {
        name: 'An toàn mạng',
        codename: 'an-toan-mang',
        position: StationPositionEnum.KHTN,
      },
      {
        name: 'Bigdata',
        codename: 'bigdata',
        position: StationPositionEnum.KHTN,
      },
      {
        name: 'Bí ẩn số',
        codename: 'bi-an-so',
        position: StationPositionEnum.KHTN_THSG,
      },
      {
        name: 'Minigame station',
        codename: 'minigame-station',
        position: StationPositionEnum.THSG,
      },
    ];

    // eslint-disable-next-line new-cap
    await this.stationGroupModel.insertMany(stationGroups.map(stationGroup => (new this.stationGroupModel(stationGroup))));

    // 4-digit PINs for stations
    const pinGenerator = () => Math.floor(1000 + Math.random() * 9000).toString();

    // Create stations
    const stations: CreateStationReqDto[] = [
      {
        name: SYSTEM_USE_ONLY_STATION_NAME,
        codename: SYSTEM_USE_ONLY_STATION_CODENAME,
        difficulty: StationDifficultyEnum.EASY,
        stationGroup: (await this.stationGroupModel.findOne({ codename: SYSTEM_USE_ONLY_STATION_GROUP_CODENAME }).exec())!,
        pin: pinGenerator(),
      },
      // blockchain
      {
        name: 'Block "Train"',
        codename: 'blocktrain',
        difficulty: StationDifficultyEnum.HARD,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'blockchain' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Vòng lặp trái cây',
        codename: 'vong-lap-trai-cay',
        difficulty: StationDifficultyEnum.EASY,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'blockchain' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Hành động đẹp',
        codename: 'hanh-dong-dep',
        difficulty: StationDifficultyEnum.EASY,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'blockchain' }).exec())!,
        pin: pinGenerator(),
      },
      // an-toan-mang
      {
        name: 'Bảo vệ dữ liệu',
        codename: 'bao-ve-du-lieu',
        difficulty: StationDifficultyEnum.MEDIUM,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'an-toan-mang' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Giả danh cao thủ',
        codename: 'gia-danh-cao-thu',
        difficulty: StationDifficultyEnum.MEDIUM,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'an-toan-mang' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Mật khẩu thép',
        codename: 'mat-khau-thep',
        difficulty: StationDifficultyEnum.MEDIUM,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'an-toan-mang' }).exec())!,
        pin: pinGenerator(),
      },
      // bigdata
      {
        name: 'Tên miền dễ thương',
        codename: 'ten-mien-de-thuong',
        difficulty: StationDifficultyEnum.EASY,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'bigdata' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Thám tử lật mặt',
        codename: 'tham-tu-lat-mat',
        difficulty: StationDifficultyEnum.HARD,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'bigdata' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Siêu trí tuệ',
        codename: 'sieu-tri-tue',
        difficulty: StationDifficultyEnum.MEDIUM,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'bigdata' }).exec())!,
        pin: pinGenerator(),
      },
      // bi-an-so
      {
        name: 'Giải mã 2 lớp',
        codename: 'giai-ma-2-lop',
        difficulty: StationDifficultyEnum.HARD,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'bi-an-so' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Mật mã toạ độ',
        codename: 'mat-ma-toa-do',
        difficulty: StationDifficultyEnum.HARD,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'bi-an-so' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Mảnh vỡ mật khẩu',
        codename: 'manh-vo-mat-khau',
        difficulty: StationDifficultyEnum.HARD,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'bi-an-so' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Chip gà vượt phố',
        codename: 'chip-ga-vuot-pho',
        difficulty: StationDifficultyEnum.HARD,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'bi-an-so' }).exec())!,
        pin: pinGenerator(),
      },
      // minigame-station
      {
        name: 'Giải cứu thanh long',
        codename: 'giai-cuu-thanh-long',
        difficulty: StationDifficultyEnum.EASY,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Thử thách mặt mo',
        codename: 'thu-thach-mat-mo',
        difficulty: StationDifficultyEnum.EASY,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Paper pipeline',
        codename: 'paper-pipeline',
        difficulty: StationDifficultyEnum.MEDIUM,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: '7 ngày ấm áp',
        codename: '7-ngay-am-ap',
        difficulty: StationDifficultyEnum.EASY,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Xếp logo',
        codename: 'xep-logo',
        difficulty: StationDifficultyEnum.MEDIUM,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Đừng để bỏng rơi',
        codename: 'dung-de-bong-roi',
        difficulty: StationDifficultyEnum.MEDIUM,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Domino tử tế',
        codename: 'domino-tu-te',
        difficulty: StationDifficultyEnum.MEDIUM,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Lời chúc du hành',
        codename: 'loi-chuc-du-hanh',
        difficulty: StationDifficultyEnum.EASY,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Đồng lòng về đích',
        codename: 'dong-long-ve-dich',
        difficulty: StationDifficultyEnum.EASY,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Lầy lội léo lưỡi',
        codename: 'lay-loi-leo-luoi',
        difficulty: StationDifficultyEnum.MEDIUM,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Khéo miệng',
        codename: 'kheo-mieng',
        difficulty: StationDifficultyEnum.HARD,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Tia chớp tái chế',
        codename: 'tia-chop-tai-che',
        difficulty: StationDifficultyEnum.HARD,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Rác nào đúng gu?',
        codename: 'rac-nao-dung-gu',
        difficulty: StationDifficultyEnum.MEDIUM,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Xếp câu đố',
        codename: 'xep-cau-do',
        difficulty: StationDifficultyEnum.EASY,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
      {
        name: 'Bấm máy là quen',
        codename: 'bam-may-la-quen',
        difficulty: StationDifficultyEnum.EASY,
        stationGroup: (await this.stationGroupModel.findOne({ codename: 'minigame-station' }).exec())!,
        pin: pinGenerator(),
      },
    ];

    await this.stationRepository.createManyStations(stations);
    this.logger.log('Database seeded with station groups and stations.');
  }

  async findStationByCodename(stationCodename: string) {
    return await this.stationRepository.findStationByCodename(stationCodename, false);
  }

  async findStationById(stationId: string) {
    return await this.stationRepository.findStationById(stationId);
  }

  async findAllStations() {
    return await this.stationRepository.findAllStations();
  }

  async createNewStation(stationData: CreateStationReqDto) {
    if (await this.findStationByCodename(stationData.name)) {
      throw new ConflictException('Station with this name already exists');
    }

    return await this.stationRepository.createNewStation(stationData);
  }

  async updateStation(stationId: string, updateData: UpdateStationReqDto) {
    if (await this.findStationById(stationId) === null) {
      throw new NotFoundException('Station not found');
    }

    return await this.stationRepository.updateStation(stationId, updateData);
  }

  async deleteStation(stationId: string) {
    if (await this.findStationById(stationId) === null) {
      throw new NotFoundException('Station not found');
    }

    return await this.stationRepository.deleteStation(stationId);
  }

  async visitStation(stationId: string, teamId: string) {
    if (!(await this.teamRepository.findTeamById(teamId))) {
      throw new NotFoundException('Team not found');
    }

    if (!(await this.canTeamVisitStation(stationId, teamId))) {
      throw new ConflictException('Team cannot visit this station');
    }

    const teamUsername = (await this.teamRepository.findTeamById(teamId))!.username;
    const station = await this.findStationById(stationId);
    const price = await this.getVisitPrice(stationId, teamUsername);

    await this.teamRepository.updateTeamCoins(station!.codename, teamUsername, -price, `Visiting station ${station!.name}`);
    return await this.stationCheckinHistoryRepository.createCheckinHistory(station!, teamId);
  }

  async canTeamVisitStation(stationId: string, teamId: string) {
    const team = await this.teamRepository.findTeamById(teamId);
    const station = await this.findStationById(stationId);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    // Check if the team skipped this station and had not yet paid (if paid, the skip entry would be removed)
    const isSkipped = await this.stationRepository.isSkipped(teamId, station!.stationGroup._id!.toString());
    if (isSkipped) {
      throw new ConflictException('Team has skipped this station and cannot visit it again until unskipped (paid).');
    }

    const price = await this.getVisitPrice(stationId, teamId);

    if (team.coins < price) {
      throw new ConflictException(`Not enough coins to visit this station. Required: ${price}, Available: ${team.coins}`);
    }

    const visitedStations = await this.findVisitedStationsByTeam(teamId);
    return !visitedStations.some(station => station._id!.toString() === stationId);
  }

  async findVisitedStationsByTeam(teamUsername: string) {
    return await this.stationCheckinHistoryRepository.findVisitedStationsByTeam(teamUsername);
  }

  async getVisitPrice(stationId: string, teamId: string) {
    const station = await this.findStationById(stationId);

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    const visitedStations = await this.findVisitedStationsByTeam(teamId);
    const visitCount = visitedStations.filter(station => station._id!.toString() === stationId).length;

    // Must be greater than or equal to 0
    switch (station.difficulty) {
      case StationDifficultyEnum.EASY:
        return Math.max(visitCount - 1, 0);
      case StationDifficultyEnum.MEDIUM:
        return Math.max(2 * visitCount - 1, 0);
      case StationDifficultyEnum.HARD:
        return Math.max(3 * visitCount - 1, 0);
      default:
        throw new NotFoundException('Station difficulty not found');
    }
  }

  async skip(teamId: string, stationCodename: string) {
    if (!(await this.teamRepository.findTeamById(teamId))) {
      throw new NotFoundException('Team not found');
    }

    if (!(await this.stationRepository.findStationByCodename(stationCodename))) {
      throw new NotFoundException('Station group not found');
    }

    const stationGroupId = (await this.stationRepository.findStationByCodename(stationCodename))!._id!.toString();

    return await this.stationRepository.skip(teamId, stationGroupId);
  }

  async unskip(teamId: string, stationCodename: string, noCoinsUpdate: boolean = false) {
    if (!(await this.teamRepository.findTeamById(teamId))) {
      throw new NotFoundException('Team not found');
    }

    const stationGroupId = (await this.stationRepository.findStationByCodename(stationCodename))!._id!.toString();

    if (noCoinsUpdate) {
      return await this.stationRepository.unskip(teamId, stationGroupId);
    }

    const team = await this.teamRepository.findTeamById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    let unskipPrice = this.stationRepository.getUnskipPrice();

    if (team.usingSkillCards.includes(SkillCardEnum.HOI_SINH)) {
      unskipPrice = 0;
      await this.teamRepository.removeUsingSkillCard(teamId, SkillCardEnum.HOI_SINH);
    }

    if (team.coins < unskipPrice) {
      throw new ConflictException('Not enough coins to unskip this station group');
    }

    await this.teamRepository.updateTeamCoins(stationCodename, team.username, -unskipPrice, `Unskipping station group ${stationGroupId}`);

    return await this.stationRepository.unskip(teamId, stationGroupId);
  }

  async verifyPin(body: WithPinDto) {
    if (!body.stationCodename || !body.pin) {
      return false;
    }

    const station = await this.stationRepository.findStationByCodename(body.stationCodename, true);
    if (!station) {
      return false;
    }

    return station.pin === body.pin;
  }
}

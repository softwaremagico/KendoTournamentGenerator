import {Element} from "./element";

export class ParticipantFightStatistics extends Element {

  menNumber: number;
  koteNumber: number;
  doNumber: number;
  tsukiNumber: number;
  hansokuNumber: number;
  ipponNumber: number;
  fusenGachiNumber: number;
  receivedMenNumber: number;
  receivedKoteNumber: number;
  receivedDoNumber: number;
  receivedTsukiNumber: number;
  receivedHansokuNumber: number;
  receivedIpponNumber: number;
  receivedFusenGachiNumber: number;
  duelsNumber: number;
  //In seconds.
  averageTime: number;
  averageWinTime: number;
  averageLostTime: number;
  totalDuelsTime: number;
  faults: number;
  receivedFaults: number;
  quickestHit: number;
  quickestReceivedHit: number;
  wonDuels: number;
  lostDuels: number;
  drawDuels: number;

  public static override copy(source: ParticipantFightStatistics, target: ParticipantFightStatistics): void {
    Element.copy(source, target);
    target.menNumber = source.menNumber;
    target.koteNumber = source.koteNumber;
    target.doNumber = source.doNumber;
    target.tsukiNumber = source.tsukiNumber;
    target.hansokuNumber = source.hansokuNumber;
    target.ipponNumber = source.ipponNumber;
    target.fusenGachiNumber = source.fusenGachiNumber;
    target.receivedMenNumber = source.receivedMenNumber;
    target.receivedKoteNumber = source.receivedKoteNumber;
    target.receivedDoNumber = source.receivedDoNumber;
    target.receivedTsukiNumber = source.receivedTsukiNumber;
    target.receivedHansokuNumber = source.receivedHansokuNumber;
    target.receivedIpponNumber = source.receivedIpponNumber;
    target.receivedFusenGachiNumber = source.receivedFusenGachiNumber;
    target.duelsNumber = source.duelsNumber;
    target.averageTime = source.averageTime;
    target.averageWinTime = source.averageWinTime;
    target.averageLostTime = source.averageLostTime;
    target.totalDuelsTime = source.totalDuelsTime;
    target.faults = source.faults;
    target.receivedFaults = source.receivedFaults;
    target.quickestHit = source.quickestHit;
    target.quickestReceivedHit = source.quickestReceivedHit;
    target.wonDuels = source.wonDuels;
    target.drawDuels = source.drawDuels;
    target.lostDuels = source.lostDuels;
  }

  public static clone(data: ParticipantFightStatistics): ParticipantFightStatistics {
    const instance: ParticipantFightStatistics = new ParticipantFightStatistics();
    this.copy(data, instance);
    return instance;
  }

  public duelsDuration(): number | undefined {
    if (this.duelsNumber && this.averageTime) {
      return this.duelsNumber * this.averageTime;
    }
    return undefined;
  }


  public getTotalHits(): number {
    return this.menNumber + this.koteNumber + this.doNumber + this.tsukiNumber + this.ipponNumber + this.hansokuNumber
      + this.fusenGachiNumber;
  }

  public getTotalReceivedHits(): number {
    return this.receivedMenNumber + this.receivedKoteNumber + this.receivedDoNumber + this.receivedTsukiNumber
      + this.receivedIpponNumber + this.receivedHansokuNumber + this.receivedFusenGachiNumber;
  }
}

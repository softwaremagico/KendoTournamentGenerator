import {Participant} from "../../../models/participant";

export class UserListData {
  participants: Participant[];
  filteredParticipants: Participant[];

  filter(filter: string): void {
    if (this.participants) {
      filter = filter.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "");
      this.filteredParticipants = this.participants.filter((user: Participant) =>
        (user.lastname ? user.lastname.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) : "") ||
        (user.name ? user.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) : "") ||
        (user.idCard ? user.idCard.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) : "") ||
        (user.club ? user.club.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) : ""));
    }
  }

}

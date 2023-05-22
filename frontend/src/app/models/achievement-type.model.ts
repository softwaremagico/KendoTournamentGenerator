export enum AchievementType {

  BILLY_THE_KID = 'BILLY_THE_KID',

  TERMINATOR = 'TERMINATOR',

  JUGGERNAUT = 'JUGGERNAUT',

  THE_KING = 'THE_KING',

  LOOKS_GOOD_FROM_FAR_AWAY_BUT = 'LOOKS_GOOD_FROM_FAR_AWAY_BUT',

  I_LOVE_THE_FLAGS = 'I_LOVE_THE_FLAGS',

  THE_TOWER = 'THE_TOWER',

  THE_CASTLE = 'THE_CASTLE',

  ENTRENCHED = 'ENTRENCHED',

  A_LITTLE_OF_EVERYTHING = 'A_LITTLE_OF_EVERYTHING',

  BONE_BREAKER = 'BONE_BREAKER',

  FLEXIBLE_AS_BAMBOO = 'FLEXIBLE_AS_BAMBOO',

  LETHAL_WEAPON = 'LETHAL_WEAPON',

  THE_WINNER = 'THE_WINNER',

  THE_WINNER_TEAM = 'THE_WINNER_TEAM',
}

export namespace AchievementType {
  export function getByKey(key: string) {
    for (const valueKey in AchievementType) {
      if ((AchievementType as any)[valueKey] === key) {
        return valueKey;
      }
    }
    return undefined;
  }
}

export namespace AchievementType {
  export function getKeys(): string[] {
    return Object.keys(AchievementType).filter(enumValue => (typeof (AchievementType[enumValue as AchievementType]) !== 'function'))
  }
}

export namespace AchievementType {
  export function toArray(): AchievementType[] {
    return AchievementType.getKeys().map(key => {
      return <AchievementType>(<any>AchievementType)[key];
    });
  }
}

export namespace AchievementType {
  export function toCamel(achievementType: AchievementType) {
    return achievementType.toLowerCase()
      .replace(/_(.)/g, function ($1) {
        return $1.toUpperCase();
      })
      .replace(/_/g, '');
  }
}

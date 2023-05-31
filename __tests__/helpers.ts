export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

export function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

export const getFakeScore = (gameType) => {
  switch (gameType) {
    case "memfuck": {
      return getRandomInt(1, 200);
    }

    case "groupthink": {
      let score;
      const scoreWin = 100;
      const scoreDraw = 50;
      const scoreLose = 0;

      const d3 = getRandomIntInclusive(1, 3);

      switch (d3) {
        case 1: {
          score = scoreWin;
          break;
        }
        case 2: {
          score = scoreDraw;
          break;
        }
        case 3: {
          score = scoreLose;
          break;
        }
      }
      return score;
    }

    case "blob": {
      return getRandomInt(10, 1000);
    }

    case "backstab": {
      let score;
      const backstabScoreWin = 100;
      const backstabScoreDraw = 50;
      const backstabScoreDrawAbstain = 1;
      const backstabScoreLose = 0;
      const d3 = getRandomIntInclusive(1, 4);

      switch (d3) {
        case 1: {
          score = backstabScoreWin;
          break;
        }
        case 2: {
          score = backstabScoreDraw;
          break;
        }
        case 3: {
          score = backstabScoreLose;
          break;
        }
        case 4: {
          score = backstabScoreDrawAbstain;
          break;
        }
      }

      return score;
    }

    case "deathrace": {
      return getRandomIntInclusive(1, 100);
    }

    default:
      return 0;
  }
};

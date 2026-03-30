import { computeDifficulty } from "@/algorithms/computeDifficulty";
import { selectTasks, type TaskForSelection } from "@/algorithms/selectTasks";
import { splitTimeBlocks } from "@/algorithms/splitTimeBlocks";

type GeneratePracticeSessionParams = {
  userLevel: string;
  availableTime: number;
  tasks: TaskForSelection[];
};

export function generatePracticeSession(params: GeneratePracticeSessionParams) {
  const difficulty = computeDifficulty(params.userLevel);
  const timeBlocks = splitTimeBlocks(params.availableTime, 5);
  const totalBlockMinutes = timeBlocks.reduce((sum, block) => sum + block, 0);

  const selectedTasks = selectTasks(params.tasks, difficulty, totalBlockMinutes);
  const totalPlannedMinutes = selectedTasks.reduce((sum, task) => sum + task.duration, 0);

  return {
    difficulty,
    timeBlocks,
    totalBlockMinutes,
    totalPlannedMinutes,
    selectedTasks,
  };
}
